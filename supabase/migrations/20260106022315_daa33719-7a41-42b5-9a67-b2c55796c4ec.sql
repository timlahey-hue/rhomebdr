-- Create table for weekly BDR time logs
CREATE TABLE public.bdr_time_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours NUMERIC(4,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for lunch meetings
CREATE TABLE public.lunch_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bdr_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lunch_meetings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (single-user app)
CREATE POLICY "Allow all operations on bdr_time_logs" 
ON public.bdr_time_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lunch_meetings" 
ON public.lunch_meetings FOR ALL USING (true) WITH CHECK (true);