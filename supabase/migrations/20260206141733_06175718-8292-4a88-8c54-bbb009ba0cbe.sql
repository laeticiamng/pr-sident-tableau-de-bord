-- Explicit deny for anonymous SELECT on contact_messages
CREATE POLICY "Deny anon select on contact_messages"
ON public.contact_messages
FOR SELECT
TO anon
USING (false);

-- Restrict UPDATE to owner only
CREATE POLICY "Only owner can update contact_messages"
ON public.contact_messages
FOR UPDATE
USING (public.is_owner());

-- Restrict DELETE to owner only
CREATE POLICY "Only owner can delete contact_messages"
ON public.contact_messages
FOR DELETE
USING (public.is_owner());