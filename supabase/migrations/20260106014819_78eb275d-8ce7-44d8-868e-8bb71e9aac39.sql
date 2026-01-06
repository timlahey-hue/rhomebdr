-- Add watched field to contacts
ALTER TABLE public.contacts ADD COLUMN watched boolean NOT NULL DEFAULT false;

-- Create activity log table for tracking contact changes
CREATE TABLE public.contact_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'stage_change', 'board_change', 'touch', 'created', 'watched'
  from_value TEXT,
  to_value TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_activity ENABLE ROW LEVEL SECURITY;

-- Create policy for access
CREATE POLICY "Allow all operations on contact_activity" 
ON public.contact_activity 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX idx_contact_activity_contact_id ON public.contact_activity(contact_id);
CREATE INDEX idx_contact_activity_created_at ON public.contact_activity(created_at DESC);