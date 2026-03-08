
-- Fix RLS policies: Convert critical SELECT/INSERT policies from RESTRICTIVE to PERMISSIVE
-- PostgreSQL requires at least one PERMISSIVE policy for access; RESTRICTIVE-only = deny all

-- ═══════════════════════════════════════════════════════════
-- TABLE: analytics_events
-- ═══════════════════════════════════════════════════════════

-- Fix INSERT: Allow anonymous tracking
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Fix SELECT: Allow owner to read
DROP POLICY IF EXISTS "Owner can read analytics" ON public.analytics_events;
CREATE POLICY "Owner can read analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (is_owner());

-- Keep restrictive: deny updates and allow owner delete (these are fine as restrictive)

-- ═══════════════════════════════════════════════════════════
-- TABLE: user_roles
-- ═══════════════════════════════════════════════════════════

-- Fix SELECT: Must be PERMISSIVE so authenticated users can read their own roles
DROP POLICY IF EXISTS "Authenticated users view own roles" ON public.user_roles;
CREATE POLICY "Authenticated users view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR is_owner());

-- Keep owner management policies as RESTRICTIVE for write operations (safe)

-- ═══════════════════════════════════════════════════════════
-- TABLE: role_permissions  
-- ═══════════════════════════════════════════════════════════

-- Fix SELECT: Must be PERMISSIVE so users can read their permissions
DROP POLICY IF EXISTS "Authenticated users view permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users view permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (is_owner() OR (role IN (SELECT ur.role FROM user_roles ur WHERE ur.user_id = auth.uid())));

-- ═══════════════════════════════════════════════════════════
-- TABLE: contact_messages
-- ═══════════════════════════════════════════════════════════

-- Fix SELECT: Must be PERMISSIVE so owner can read messages
DROP POLICY IF EXISTS "Owner reads contact messages" ON public.contact_messages;
CREATE POLICY "Owner reads contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (is_owner());
