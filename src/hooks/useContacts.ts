import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/bdr';

const mapDbToContact = (row: any): Contact => ({
  id: row.id,
  name: row.name,
  company: row.company,
  role: row.role,
  relationshipType: row.relationship_type,
  lastTouchDate: row.last_touch_date,
  nextTouchDate: row.next_touch_date,
  statusNotes: row.status_notes || '',
  relationshipStrength: row.relationship_strength,
  tags: row.tags || [],
  board: row.board,
  stage: row.stage,
  createdAt: row.created_at,
});

const mapContactToDb = (contact: Omit<Contact, 'id' | 'createdAt'>) => ({
  name: contact.name,
  company: contact.company,
  role: contact.role,
  relationship_type: contact.relationshipType,
  last_touch_date: contact.lastTouchDate,
  next_touch_date: contact.nextTouchDate,
  status_notes: contact.statusNotes,
  relationship_strength: contact.relationshipStrength,
  tags: contact.tags,
  board: contact.board,
  stage: contact.stage,
});

export const useContacts = () => {
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbToContact);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(mapContactToDb(contact))
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToContact(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.relationshipType !== undefined) dbUpdates.relationship_type = updates.relationshipType;
      if (updates.lastTouchDate !== undefined) dbUpdates.last_touch_date = updates.lastTouchDate;
      if (updates.nextTouchDate !== undefined) dbUpdates.next_touch_date = updates.nextTouchDate;
      if (updates.statusNotes !== undefined) dbUpdates.status_notes = updates.statusNotes;
      if (updates.relationshipStrength !== undefined) dbUpdates.relationship_strength = updates.relationshipStrength;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.board !== undefined) dbUpdates.board = updates.board;
      if (updates.stage !== undefined) dbUpdates.stage = updates.stage;

      const { error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const addContact = (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    return addMutation.mutateAsync(contact);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    updateMutation.mutate({ id, updates });
  };

  const deleteContact = (id: string) => {
    deleteMutation.mutate(id);
  };

  const moveContact = (
    id: string,
    newStage: Contact['stage'],
    newBoard?: Contact['board']
  ) => {
    const updates: Partial<Contact> = { stage: newStage };
    if (newBoard) updates.board = newBoard;
    updateMutation.mutate({ id, updates });
  };

  const getProspectContacts = () =>
    contacts.filter((c) => c.board === 'prospect');

  const getActiveContacts = () =>
    contacts.filter((c) => c.board === 'active');

  return {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    moveContact,
    getProspectContacts,
    getActiveContacts,
  };
};
