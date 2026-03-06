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

export const useRecentNotes = (limit = 20) => {
  const { currentOrg } = useOrganization();

  const { data: recentNotes = [], isLoading } = useQuery({
    queryKey: ['recent-notes', limit, currentOrg],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*, contacts(name, company, organization)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data
        .filter((row: any) => row.contacts?.organization === currentOrg)
        .map((row: any): RecentNote => ({
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
