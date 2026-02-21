ALTER TABLE public.contacts ADD COLUMN organization TEXT NOT NULL DEFAULT 'rhome';

ALTER TABLE public.bdr_time_logs ADD COLUMN organization TEXT NOT NULL DEFAULT 'rhome';

ALTER TABLE public.voice_profile ADD COLUMN organization TEXT NOT NULL DEFAULT 'rhome';

CREATE INDEX idx_contacts_organization ON public.contacts(organization);

CREATE INDEX idx_bdr_time_logs_organization ON public.bdr_time_logs(organization);