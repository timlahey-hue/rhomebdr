-- Add secondary phone and email fields for primary contact
ALTER TABLE public.contacts 
ADD COLUMN secondary_phone text,
ADD COLUMN secondary_email text;