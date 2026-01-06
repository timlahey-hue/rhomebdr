import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

interface TimeLog {
  id: string;
  logDate: string;
  hours: number;
  notes: string | null;
  createdAt: string;
}

interface LunchMeeting {
  id: string;
  meetingDate: string;
  contactId: string | null;
  contactName?: string;
  notes: string | null;
  createdAt: string;
}

// Weekly goal: 30 hours (75% of 40-hour week)
const WEEKLY_HOURS_GOAL = 30;
const MONTHLY_LUNCH_GOAL = 2;

export function useBDRGoals() {
  const queryClient = useQueryClient();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Fetch this week's time logs
  const { data: weeklyTimeLogs = [], isLoading: isLoadingTime } = useQuery({
    queryKey: ['bdr-time-logs', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bdr_time_logs')
        .select('*')
        .gte('log_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('log_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('log_date', { ascending: false });

      if (error) throw error;
      return (data || []).map((log: any) => ({
        id: log.id,
        logDate: log.log_date,
        hours: parseFloat(log.hours),
        notes: log.notes,
        createdAt: log.created_at,
      })) as TimeLog[];
    },
  });

  // Fetch this month's lunch meetings
  const { data: monthlyLunchMeetings = [], isLoading: isLoadingLunch } = useQuery({
    queryKey: ['lunch-meetings', format(monthStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lunch_meetings')
        .select(`
          *,
          contacts:contact_id (name)
        `)
        .gte('meeting_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('meeting_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      return (data || []).map((meeting: any) => ({
        id: meeting.id,
        meetingDate: meeting.meeting_date,
        contactId: meeting.contact_id,
        contactName: meeting.contacts?.name,
        notes: meeting.notes,
        createdAt: meeting.created_at,
      })) as LunchMeeting[];
    },
  });

  // Add time log mutation
  const addTimeLog = useMutation({
    mutationFn: async ({ hours, notes, date }: { hours: number; notes?: string; date?: string }) => {
      const { error } = await supabase
        .from('bdr_time_logs')
        .insert({
          hours,
          notes: notes || null,
          log_date: date || format(now, 'yyyy-MM-dd'),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bdr-time-logs'] });
    },
  });

  // Add lunch meeting mutation
  const addLunchMeeting = useMutation({
    mutationFn: async ({ contactId, notes, date }: { contactId?: string; notes?: string; date?: string }) => {
      const { error } = await supabase
        .from('lunch_meetings')
        .insert({
          contact_id: contactId || null,
          notes: notes || null,
          meeting_date: date || format(now, 'yyyy-MM-dd'),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lunch-meetings'] });
    },
  });

  // Delete time log
  const deleteTimeLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bdr_time_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bdr-time-logs'] });
    },
  });

  // Delete lunch meeting
  const deleteLunchMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lunch_meetings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lunch-meetings'] });
    },
  });

  // Calculate totals
  const totalWeeklyHours = weeklyTimeLogs.reduce((sum, log) => sum + log.hours, 0);
  const weeklyProgress = Math.min((totalWeeklyHours / WEEKLY_HOURS_GOAL) * 100, 100);
  const lunchMeetingsCount = monthlyLunchMeetings.length;
  const lunchProgress = Math.min((lunchMeetingsCount / MONTHLY_LUNCH_GOAL) * 100, 100);

  return {
    // Data
    weeklyTimeLogs,
    monthlyLunchMeetings,
    
    // Calculated values
    totalWeeklyHours,
    weeklyProgress,
    weeklyGoal: WEEKLY_HOURS_GOAL,
    lunchMeetingsCount,
    lunchProgress,
    lunchGoal: MONTHLY_LUNCH_GOAL,
    
    // Loading states
    isLoading: isLoadingTime || isLoadingLunch,
    
    // Mutations
    addTimeLog,
    addLunchMeeting,
    deleteTimeLog,
    deleteLunchMeeting,
  };
}
