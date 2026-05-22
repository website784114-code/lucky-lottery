DROP POLICY IF EXISTS "Admins manage games" ON public.games;
DROP POLICY IF EXISTS "Admins manage results" ON public.results;
CREATE POLICY "Public manage games" ON public.games FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public manage results" ON public.results FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);