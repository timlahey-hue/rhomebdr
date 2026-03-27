import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/bdr';
import { useOrganization } from '@/contexts/OrganizationContext';

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
  updatedAt: row.updated_at,
  address: row.address,
  website: row.website,
  phone: row.phone,
  email: row.email,
  title: row.title,
  companyType: row.company_type,
  aiSummary: row.ai_summary,
  aiAvPartners: row.ai_av_partners,
  watched: row.watched || false,
  tier: row.tier || undefined,
  secondaryContactName: row.secondary_contact_name,
  secondaryContactRole: row.secondary_contact_role,
  secondaryContactTitle: row.secondary_contact_title,
  secondaryContactPhone: row.secondary_contact_phone,
  secondaryContactEmail: row.secondary_contact_email,
  secondaryPhone: row.secondary_phone,
  secondaryEmail: row.secondary_email,
  tertiaryContactName: row.tertiary_contact_name,
  tertiaryContactTitle: row.tertiary_contact_title,
  tertiaryContactPhone: row.tertiary_contact_phone,
  tertiaryContactEmail: row.tertiary_contact_email,
  competitorNotes: row.competitor_notes,
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
  address: contact.address,
  website: contact.website,
  phone: contact.phone,
  email: contact.email,
  title: contact.title,
  company_type: contact.companyType,
  tier: contact.tier || null,
  secondary_contact_name: contact.secondaryContactName,
  secondary_contact_role: contact.secondaryContactRole,
  secondary_contact_title: contact.secondaryContactTitle,
  secondary_contact_phone: contact.secondaryContactPhone,
  secondary_contact_email: contact.secondaryContactEmail,
  secondary_phone: contact.secondaryPhone,
  secondary_email: contact.secondaryEmail,
  tertiary_contact_name: contact.tertiaryContactName,
  tertiary_contact_title: contact.tertiaryContactTitle,
  tertiary_contact_phone: contact.tertiaryContactPhone,
  tertiary_contact_email: contact.tertiaryContactEmail,
  competitor_notes: contact.competitorNotes,
});

export const useContacts = () => {
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();

  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ['contacts', currentOrg],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization', currentOrg!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbToContact);
    },
    enabled: !!currentOrg,
  });

  const addMutation = useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...mapContactToDb(contact), organization: currentOrg! })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToContact(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentOrg] });
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
      if (updates.watched !== undefined) dbUpdates.watched = updates.watched;
      if (updates.website !== undefined) dbUpdates.website = updates.website;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.companyType !== undefined) dbUpdates.company_type = updates.companyType;
      if (updates.tier !== undefined) dbUpdates.tier = updates.tier;
      if (updates.secondaryContactName !== undefined) dbUpdates.secondary_contact_name = updates.secondaryContactName;
      if (updates.secondaryContactRole !== undefined) dbUpdates.secondary_contact_role = updates.secondaryContactRole;
      if (updates.secondaryContactTitle !== undefined) dbUpdates.secondary_contact_title = updates.secondaryContactTitle;
      if (updates.secondaryContactPhone !== undefined) dbUpdates.secondary_contact_phone = updates.secondaryContactPhone;
      if (updates.secondaryContactEmail !== undefined) dbUpdates.secondary_contact_email = updates.secondaryContactEmail;
      if (updates.secondaryPhone !== undefined) dbUpdates.secondary_phone = updates.secondaryPhone;
      if (updates.secondaryEmail !== undefined) dbUpdates.secondary_email = updates.secondaryEmail;
      if (updates.tertiaryContactName !== undefined) dbUpdates.tertiary_contact_name = updates.tertiaryContactName;
      if (updates.tertiaryContactTitle !== undefined) dbUpdates.tertiary_contact_title = updates.tertiaryContactTitle;
      if (updates.tertiaryContactPhone !== undefined) dbUpdates.tertiary_contact_phone = updates.tertiaryContactPhone;
      if (updates.tertiaryContactEmail !== undefined) dbUpdates.tertiary_contact_email = updates.tertiaryContactEmail;
      if (updates.competitorNotes !== undefined) dbUpdates.competitor_notes = updates.competitorNotes;

      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentOrg] });
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
      queryClient.invalidateQueries({ queryKey: ['contacts', currentOrg] });
    },
  });

  const addContact = (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    return addMutation.mutateAsync(contact);
  };

  const importContacts = async (contacts: Omit<Contact, 'id' | 'createdAt'>[]) => {
    const dbContacts = contacts.map(c => ({ ...mapContactToDb(c), organization: currentOrg! }));
    const { error } = await supabase.from('contacts').insert(dbContacts);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['contacts', currentOrg] });
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    updateMutation.mutate({ id, updates });
  };

  const deleteContact = (id: string) => {
    deleteMutation.mutate(id);
  };

  const moveContact = async (
    id: string,
    newStage: Contact['stage'],
    newBoard?: Contact['board']
  ) => {
    const contact = contacts.find((c) => c.id === id);
    const updates: Partial<Contact> = { stage: newStage };
    if (newBoard) updates.board = newBoard;
    
    updateMutation.mutate({ id, updates });
    
    // Log activity for stage/board changes
    if (contact) {
      if (newBoard && contact.board !== newBoard) {
        await supabase.from('contact_activity').insert({
          contact_id: id,
          activity_type: 'board_change',
          from_value: contact.board,
          to_value: newBoard,
        });
      }
      if (contact.stage !== newStage) {
        await supabase.from('contact_activity').insert({
          contact_id: id,
          activity_type: 'stage_change',
          from_value: contact.stage,
          to_value: newStage,
        });
      }
    }
  };

  const getProspectContacts = () =>
    contacts.filter((c) => c.board === 'prospect');

  const getActiveContacts = () =>
    contacts.filter((c) => c.board === 'active');

  const clearBoard = async (board: 'prospect' | 'active') => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('board', board)
      .eq('organization', currentOrg!);
    
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['contacts', currentOrg] });
  };

  return {
    contacts,
    isLoading,
    refetch,
    addContact,
    importContacts,
    updateContact,
    deleteContact,
    moveContact,
    getProspectContacts,
    getActiveContacts,
    clearBoard,
  };
};
