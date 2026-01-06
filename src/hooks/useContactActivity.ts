import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactActivity {
  id: string;
  contactId: string;
  activityType: 'stage_change' | 'board_change' | 'touch' | 'created' | 'watched' | 'lunch_meeting';
  fromValue: string | null;
  toValue: string | null;
  notes: string | null;
  createdAt: string;
}

interface ActivityWithContact extends ContactActivity {
  contactName: string;
  contactCompany: string;
}

const mapDbToActivity = (row: any): ContactActivity => ({
  id: row.id,
  contactId: row.contact_id,
  activityType: row.activity_type,
  fromValue: row.from_value,
  toValue: row.to_value,
  notes: row.notes,
  createdAt: row.created_at,
});

export const useContactActivity = (contactId?: string) => {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['contact-activity', contactId],
    queryFn: async () => {
      let query = supabase
        .from('contact_activity')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contactId) {
        query = query.eq('contact_id', contactId);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data.map(mapDbToActivity);
    },
  });

  const logActivityMutation = useMutation({
    mutationFn: async ({
      contactId,
      activityType,
      fromValue,
      toValue,
      notes,
    }: {
      contactId: string;
      activityType: ContactActivity['activityType'];
      fromValue?: string;
      toValue?: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('contact_activity')
        .insert({
          contact_id: contactId,
          activity_type: activityType,
          from_value: fromValue || null,
          to_value: toValue || null,
          notes: notes || null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-activity'] });
    },
  });

  const logActivity = (params: {
    contactId: string;
    activityType: ContactActivity['activityType'];
    fromValue?: string;
    toValue?: string;
    notes?: string;
  }) => {
    return logActivityMutation.mutateAsync(params);
  };

  return {
    activities,
    isLoading,
    logActivity,
  };
};

export const useAllContactActivity = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['all-contact-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_activity')
        .select(`
          *,
          contacts:contact_id (name, company)
        `)
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      
      return data.map((row: any): ActivityWithContact => ({
        ...mapDbToActivity(row),
        contactName: row.contacts?.name || 'Unknown',
        contactCompany: row.contacts?.company || '',
      }));
    },
  });

  return { activities, isLoading };
};
