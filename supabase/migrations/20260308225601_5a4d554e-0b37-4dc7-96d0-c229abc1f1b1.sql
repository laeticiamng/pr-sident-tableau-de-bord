
-- Fix analytics_events: convert RESTRICTIVE INSERT to PERMISSIVE for anonymous tracking
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Convert owner SELECT to PERMISSIVE  
DROP POLICY IF EXISTS "Owner can read analytics" ON public.analytics_events;
CREATE POLICY "Owner can read analytics"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (is_owner());

-- Keep restrictive UPDATE deny and DELETE as-is (they're fine as restrictive)
