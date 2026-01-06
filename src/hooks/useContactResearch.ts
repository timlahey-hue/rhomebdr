import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/bdr';
import { toast } from 'sonner';

interface ResearchResult {
  summary: string;
  avPartners: string;
}

export function useContactResearch() {
  const [isResearching, setIsResearching] = useState<string | null>(null);

  const researchContact = async (contact: Contact): Promise<ResearchResult | null> => {
    setIsResearching(contact.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('research-contact', {
        body: {
          contactName: contact.name,
          company: contact.company,
          role: contact.role,
          website: contact.website,
        },
      });

      if (error) {
        console.error('Research error:', error);
        toast.error('Failed to research contact');
        return null;
      }

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      // Update the contact in the database with the research results
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          ai_summary: data.summary,
          ai_av_partners: data.avPartners,
        })
        .eq('id', contact.id);

      if (updateError) {
        console.error('Error saving research:', updateError);
        toast.error('Failed to save research results');
      } else {
        toast.success('Research completed');
      }

      return data;
    } catch (err) {
      console.error('Research error:', err);
      toast.error('Failed to research contact');
      return null;
    } finally {
      setIsResearching(null);
    }
  };

  return {
    researchContact,
    isResearching,
  };
}