import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface Reminder {
  id: string;
  contactId: string;
  contactName: string;
  contactCompany: string;
  reminderDate: string;
  notes: string | null;
  createdAt: string;
}

export const useReminders = () => {
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders', currentOrg],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_reminders')
        .select('*, contacts(name, company, organization)')
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      return data
        .filter((row: any) => row.contacts?.organization === currentOrg)
        .map((row: any): Reminder => ({
          id: row.id,
          contactId: row.contact_id,
          contactName: row.contacts?.name || 'Unknown',
          contactCompany: row.contacts?.company || '',
          reminderDate: row.reminder_date,
          notes: row.notes,
          createdAt: row.created_at,
        }));
    },
    enabled: !!currentOrg,
  });

  const addReminderMutation = useMutation({
    mutationFn: async ({ contactId, reminderDate, notes }: { contactId: string; reminderDate: string; notes?: string }) => {
      const { error } = await supabase
        .from('contact_reminders')
        .insert({ contact_id: contactId, reminder_date: reminderDate, notes: notes || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_reminders')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const upcomingReminders = reminders.filter(r => r.reminderDate >= today);
  const overdueReminders = reminders.filter(r => r.reminderDate < today);

  return {
    reminders,
    upcomingReminders,
    overdueReminders,
    isLoading,
    addReminder: addReminderMutation.mutateAsync,
    deleteReminder: deleteReminderMutation.mutate,
    isAdding: addReminderMutation.isPending,
  };
};
