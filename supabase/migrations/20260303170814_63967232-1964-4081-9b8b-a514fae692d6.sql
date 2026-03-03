CREATE POLICY "Deny all updates on analytics_events"
ON public.analytics_events
FOR UPDATE
TO authenticated, anon
USING (false);