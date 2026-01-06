import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CalendarTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

const STORAGE_KEY = 'rhome-google-calendar-tokens';

export const useGoogleCalendar = () => {
  const [tokens, setTokens] = useState<CalendarTokens | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTokens(parsed);
        setIsConnected(true);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const getRedirectUri = () => {
    return `${window.location.origin}/calendar-callback`;
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { redirect_uri: getRedirectUri() },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      // Open OAuth popup
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to initiate Google Calendar auth:', error);
      setIsConnecting(false);
      throw error;
    }
  };

  const handleCallback = async (code: string) => {
    try {
      const redirectUri = getRedirectUri();
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: {},
      });

      // Call the callback action
      const callbackUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=callback&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      const response = await fetch(callbackUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const tokenData = await response.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error);
      }

      const calendarTokens: CalendarTokens = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: Date.now() + (tokenData.expires_in * 1000),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarTokens));
      setTokens(calendarTokens);
      setIsConnected(true);
      
      return true;
    } catch (error) {
      console.error('Failed to handle calendar callback:', error);
      throw error;
    }
  };

  const refreshTokenIfNeeded = async (): Promise<string | null> => {
    if (!tokens) return null;

    // Check if token is expired or will expire in next 5 minutes
    if (tokens.expiry_date > Date.now() + 5 * 60 * 1000) {
      return tokens.access_token;
    }

    // Refresh the token
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar?action=refresh', {
        body: { refresh_token: tokens.refresh_token },
      });

      if (error || data.error) {
        throw new Error(error?.message || data.error);
      }

      const newTokens: CalendarTokens = {
        access_token: data.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: Date.now() + (data.expires_in * 1000),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
      setTokens(newTokens);
      
      return data.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      disconnect();
      return null;
    }
  };

  const createEvent = async (event: {
    summary: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    timeZone?: string;
  }) => {
    const accessToken = await refreshTokenIfNeeded();
    if (!accessToken) {
      throw new Error('Not connected to Google Calendar');
    }

    const { data, error } = await supabase.functions.invoke('google-calendar?action=create-event', {
      body: {
        access_token: accessToken,
        event,
      },
    });

    if (error || data.error) {
      throw new Error(error?.message || data.error);
    }

    return data;
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTokens(null);
    setIsConnected(false);
  };

  return {
    isConnected,
    isConnecting,
    connect,
    handleCallback,
    createEvent,
    disconnect,
  };
};
