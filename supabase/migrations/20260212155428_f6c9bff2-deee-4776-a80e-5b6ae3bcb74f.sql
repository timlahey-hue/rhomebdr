
CREATE TABLE public.contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on contact_notes"
ON public.contact_notes
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_contact_notes_contact_id ON public.contact_notes(contact_id);
