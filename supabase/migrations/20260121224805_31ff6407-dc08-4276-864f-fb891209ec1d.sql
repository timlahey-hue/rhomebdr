-- Add tier column to contacts table for prioritization
ALTER TABLE public.contacts 
ADD COLUMN tier integer CHECK (tier IN (1, 2, 3));