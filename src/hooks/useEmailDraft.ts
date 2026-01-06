import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface EmailDraft {
  subject: string;
  body: string;
}

interface DraftEmailParams {
  contactName: string;
  contactCompany: string;
  contactRole: string;
  relationshipStage: string;
  actionType: string;
  lastNotes: string;
}

export const useEmailDraft = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch voice profile
  const { data: voiceProfile } = useQuery({
    queryKey: ['voiceProfile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_profile')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const generateDraft = async (params: DraftEmailParams) => {
    setIsGenerating(true);
    setError(null);
    setDraft(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('draft-email', {
        body: {
          ...params,
          voiceDescription: voiceProfile?.tone_description || 'Professional, warm, and relationship-focused.',
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setDraft(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate email draft';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearDraft = () => {
    setDraft(null);
    setError(null);
  };

  return {
    draft,
    isGenerating,
    error,
    generateDraft,
    clearDraft,
    voiceProfile,
  };
};
