
-- P0: Fix RLS policies — Convert intentional access policies from RESTRICTIVE to PERMISSIVE
-- PostgreSQL requires DROP + re-CREATE to change policy type

-- ═══════════════════════════════════════════════════════════════
-- TABLE: analytics_events
-- ═══════════════════════════════════════════════════════════════

-- "Anyone can insert analytics events" → PERMISSIVE (intentional public access)
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- "Owner can read analytics" → PERMISSIVE (intentional owner access)
DROP POLICY IF EXISTS "Owner can read analytics" ON public.analytics_events;
CREATE POLICY "Owner can read analytics" ON public.analytics_events
  FOR SELECT
  USING (is_owner());

-- "Owner can delete analytics" → PERMISSIVE (intentional owner access)
DROP POLICY IF EXISTS "Owner can delete analytics" ON public.analytics_events;
CREATE POLICY "Owner can delete analytics" ON public.analytics_events
  FOR DELETE
  USING (is_owner());

-- Keep RESTRICTIVE: "Deny all updates on analytics_events" stays as-is (blocking policy)

-- ═══════════════════════════════════════════════════════════════
-- TABLE: user_roles
-- ═══════════════════════════════════════════════════════════════

-- "Authenticated users view own roles" → PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users view own roles" ON public.user_roles;
CREATE POLICY "Authenticated users view own roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR is_owner());

-- "Owner manages user roles" → PERMISSIVE (ALL)
DROP POLICY IF EXISTS "Owner manages user roles" ON public.user_roles;
CREATE POLICY "Owner manages user roles" ON public.user_roles
  FOR ALL
  USING (is_owner())
  WITH CHECK (is_owner());

-- Keep RESTRICTIVE deny policies as blocking layers

-- ═══════════════════════════════════════════════════════════════
-- TABLE: role_permissions
-- ═══════════════════════════════════════════════════════════════

-- "Authenticated users view permissions" → PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users view permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users view permissions" ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (is_owner() OR (role IN (SELECT ur.role FROM user_roles ur WHERE ur.user_id = auth.uid())));

-- "Owner manages role permissions" → PERMISSIVE (ALL)
DROP POLICY IF EXISTS "Owner manages role permissions" ON public.role_permissions;
CREATE POLICY "Owner manages role permissions" ON public.role_permissions
  FOR ALL
  USING (is_owner())
  WITH CHECK (is_owner());

-- Keep RESTRICTIVE deny policies as blocking layers

-- ═══════════════════════════════════════════════════════════════
-- TABLE: contact_messages
-- ═══════════════════════════════════════════════════════════════

-- "Owner reads contact messages" → PERMISSIVE
DROP POLICY IF EXISTS "Owner reads contact messages" ON public.contact_messages;
CREATE POLICY "Owner reads contact messages" ON public.contact_messages
  FOR SELECT
  USING (is_owner());

-- "Only owner can update contact_messages" → PERMISSIVE
DROP POLICY IF EXISTS "Only owner can update contact_messages" ON public.contact_messages;
CREATE POLICY "Only owner can update contact_messages" ON public.contact_messages
  FOR UPDATE
  USING (is_owner());

-- "Only owner can delete contact_messages" → PERMISSIVE
DROP POLICY IF EXISTS "Only owner can delete contact_messages" ON public.contact_messages;
CREATE POLICY "Only owner can delete contact_messages" ON public.contact_messages
  FOR DELETE
  USING (is_owner());

-- Keep RESTRICTIVE: "Deny anon select on contact_messages" stays as-is
