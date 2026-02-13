
-- Reminders table for follow-up scheduling
CREATE TABLE public.contact_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on contact_reminders"
ON public.contact_reminders FOR ALL
USING (true) WITH CHECK (true);

CREATE INDEX idx_contact_reminders_date ON public.contact_reminders(reminder_date);
CREATE INDEX idx_contact_reminders_contact ON public.contact_reminders(contact_id);

-- Add competitor notes field to contacts
ALTER TABLE public.contacts ADD COLUMN competitor_notes TEXT;
