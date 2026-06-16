
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;
REVOKE SELECT ON public.submissions FROM anon;

CREATE POLICY "Admins can view submissions"
  ON public.submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
