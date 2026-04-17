-- P0: Stop broadcasting contact_messages via Realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.contact_messages;

-- P0: Explicit deny INSERT policy on contact_messages (only service_role inserts via edge function)
CREATE POLICY "Deny client inserts on contact_messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- P0: Harden has_org_access to ignore caller-supplied user_id
CREATE OR REPLACE FUNCTION public.has_org_access(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = _org_id
  );
$$;

COMMENT ON FUNCTION public.has_org_access(uuid, uuid)
IS 'Hardened: ignores _user_id parameter and uses auth.uid() internally. Prevents cross-user organization membership probing.';

-- P1: Tighten analytics_events INSERT policy
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Anon can insert minimal analytics"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IS NOT NULL
  AND length(event_type) <= 64
  AND (event_name IS NULL OR length(event_name) <= 128)
  AND (page_path IS NULL OR length(page_path) <= 512)
  AND (referrer IS NULL OR length(referrer) <= 1024)
  AND (user_agent IS NULL OR length(user_agent) <= 512)
);