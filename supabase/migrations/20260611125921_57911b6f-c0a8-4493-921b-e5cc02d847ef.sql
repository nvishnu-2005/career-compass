-- Restrict submissions reads to admins; keep public insert with explicit check

-- 1) Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2) Tighten submissions policies
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.submissions;

-- Only admins can read submissions (contains PII: name + email)
CREATE POLICY "Admins can view submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Anyone (including anon) can submit the form, but row must be well-formed
CREATE POLICY "Anyone can submit a recommendation request"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(qualification) BETWEEN 1 AND 100
    AND work_experience >= 0 AND work_experience <= 80
    AND length(profession) BETWEEN 1 AND 200
    AND length(career_goal) BETWEEN 1 AND 5000
    AND length(recommendation) BETWEEN 1 AND 200
  );
