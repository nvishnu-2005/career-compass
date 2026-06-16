
DROP POLICY IF EXISTS "Admins can view submissions" ON public.submissions;

CREATE POLICY "Anyone can view submissions"
  ON public.submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.submissions TO anon;
