CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  qualification TEXT NOT NULL,
  work_experience INTEGER NOT NULL,
  profession TEXT NOT NULL,
  career_goal TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert submissions" ON public.submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT TO anon, authenticated USING (true);