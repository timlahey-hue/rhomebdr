-- Add new contact fields for Pipeline contacts
ALTER TABLE public.contacts
ADD COLUMN phone text,
ADD COLUMN email text,
ADD COLUMN title text,
ADD COLUMN company_type text,
ADD COLUMN secondary_contact_name text,
ADD COLUMN secondary_contact_phone text,
ADD COLUMN secondary_contact_email text,
ADD COLUMN secondary_contact_title text;