-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  last_touch_date DATE,
  next_touch_date DATE,
  status_notes TEXT DEFAULT '',
  relationship_strength INTEGER NOT NULL DEFAULT 1 CHECK (relationship_strength >= 1 AND relationship_strength <= 5),
  tags TEXT[] DEFAULT '{}',
  board TEXT NOT NULL CHECK (board IN ('prospect', 'active')),
  stage TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write (single user tool, no auth needed for simplicity)
CREATE POLICY "Allow all operations on contacts"
  ON public.contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create email_drafts table to store AI-generated drafts
CREATE TABLE public.email_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email_drafts
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for email_drafts
CREATE POLICY "Allow all operations on email_drafts"
  ON public.email_drafts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create voice_profile table to store the user's communication style
CREATE TABLE public.voice_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sample_emails TEXT[] DEFAULT '{}',
  tone_description TEXT DEFAULT 'Professional, warm, and relationship-focused. Avoids hard selling. Focuses on adding value and building trust.',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on voice_profile
ALTER TABLE public.voice_profile ENABLE ROW LEVEL SECURITY;

-- Create policy for voice_profile
CREATE POLICY "Allow all operations on voice_profile"
  ON public.voice_profile
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default voice profile
INSERT INTO public.voice_profile (tone_description) VALUES (
  'Professional, warm, and relationship-focused. I avoid hard selling and focus on adding value. My tone is conversational but respectful. I personalize outreach based on the person''s work and interests. I prefer short, thoughtful messages over long formal emails.'
);