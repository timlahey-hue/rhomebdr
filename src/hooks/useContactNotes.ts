import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactNote {
  id: string;
  contactId: string;
  note: string;
  createdAt: string;
}

const mapDbToNote = (row: any): ContactNote => ({
  id: row.id,
  contactId: row.contact_id,
  note: row.note,
  createdAt: row.created_at,
});

export const useContactNotes = (contactId?: string) => {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['contact-notes', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToNote);
    },
    enabled: !!contactId,
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ contactId, note }: { contactId: string; note: string }) => {
      const { error } = await supabase
        .from('contact_notes')
        .insert({ contact_id: contactId, note });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
    },
  });

  const addNote = (contactId: string, note: string) => {
    return addNoteMutation.mutateAsync({ contactId, note });
  };

  return { notes, isLoading, addNote, isAdding: addNoteMutation.isPending };
};
