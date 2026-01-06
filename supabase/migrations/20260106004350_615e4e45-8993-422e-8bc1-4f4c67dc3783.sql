-- Add new columns to contacts table for import fields
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS website text;