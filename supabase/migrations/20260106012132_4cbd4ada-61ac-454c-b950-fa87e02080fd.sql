-- Add AI research summary field to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS ai_av_partners TEXT;