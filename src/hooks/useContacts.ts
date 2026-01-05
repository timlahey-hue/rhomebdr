import { useState, useEffect } from 'react';
import { Contact } from '@/types/bdr';
import { mockContacts } from '@/lib/mockData';

const STORAGE_KEY = 'rhome-bdr-contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setContacts(JSON.parse(stored));
      } catch {
        setContacts(mockContacts);
      }
    } else {
      setContacts(mockContacts);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts, isLoading]);

  const addContact = (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContacts((prev) => [...prev, newContact]);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, ...updates } : contact
      )
    );
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const moveContact = (
    id: string,
    newStage: Contact['stage'],
    newBoard?: Contact['board']
  ) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              stage: newStage,
              ...(newBoard && { board: newBoard }),
            }
          : contact
      )
    );
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
