import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface RecentNote {
  id: string;
  contactId: string;
  contactName: string;
  contactCompany: string;
  note: string;
  createdAt: string;
}

export type DateRange = '1week' | '2weeks' | '30days';

const getDateCutoff = (range: DateRange): string => {
  const now = new Date();
  switch (range) {
    case '1week':
      now.setDate(now.getDate() - 7);
      break;
    case '2weeks':
      now.setDate(now.getDate() - 14);
      break;
    case '30days':
      now.setDate(now.getDate() - 30);
      break;
  }
  return now.toISOString();
};

export const useRecentNotes = (dateRange: DateRange = '30days') => {
  const { currentOrg } = useOrganization();

  const { data: recentNotes = [], isLoading } = useQuery({
    queryKey: ['recent-notes', dateRange, currentOrg],
    queryFn: async () => {
      const cutoff = getDateCutoff(dateRange);

      const { data, error } = await supabase
        .from('contact_notes')
        .select('*, contacts!inner(name, company, organization)')
        .eq('contacts.organization', currentOrg)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: any): RecentNote => ({
        id: row.id,
        contactId: row.contact_id,
        contactName: row.contacts?.name || 'Unknown',
        contactCompany: row.contacts?.company || '',
        note: row.note,
        createdAt: row.created_at,
      }));
    },
    enabled: !!currentOrg,
  });

  return { recentNotes, isLoading };
};
