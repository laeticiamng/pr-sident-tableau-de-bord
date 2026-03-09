
-- Fix P0: Add PERMISSIVE policies to all 4 public tables
-- The existing RESTRICTIVE policies will act as additional AND filters

-- ========== user_roles ==========
-- PERMISSIVE SELECT for authenticated (RESTRICTIVE "Authenticated users view own roles" will filter)
CREATE POLICY "permissive_select_user_roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

-- PERMISSIVE INSERT for authenticated (RESTRICTIVE "Deny non-owner insert" will filter to owner)
CREATE POLICY "permissive_insert_user_roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (true);

-- PERMISSIVE UPDATE for authenticated (RESTRICTIVE will filter to owner)
CREATE POLICY "permissive_update_user_roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- PERMISSIVE DELETE for authenticated (RESTRICTIVE will filter to owner)
CREATE POLICY "permissive_delete_user_roles" ON public.user_roles
  FOR DELETE TO authenticated USING (true);

-- ========== role_permissions ==========
CREATE POLICY "permissive_select_role_permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissive_insert_role_permissions" ON public.role_permissions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "permissive_update_role_permissions" ON public.role_permissions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "permissive_delete_role_permissions" ON public.role_permissions
  FOR DELETE TO authenticated USING (true);

-- ========== analytics_events ==========
-- PERMISSIVE INSERT for anon + authenticated
CREATE POLICY "permissive_insert_analytics" ON public.analytics_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- PERMISSIVE SELECT for authenticated (RESTRICTIVE "Owner can read" will filter to owner)
CREATE POLICY "permissive_select_analytics" ON public.analytics_events
  FOR SELECT TO authenticated USING (true);

-- PERMISSIVE DELETE for authenticated (RESTRICTIVE will filter to owner)
CREATE POLICY "permissive_delete_analytics" ON public.analytics_events
  FOR DELETE TO authenticated USING (true);

-- ========== contact_messages ==========
-- No INSERT needed (edge function uses service_role)
-- PERMISSIVE SELECT for authenticated (RESTRICTIVE will filter to owner)
CREATE POLICY "permissive_select_contact_messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (true);

-- PERMISSIVE UPDATE for authenticated (RESTRICTIVE will filter to owner)
CREATE POLICY "permissive_update_contact_messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (true);

-- PERMISSIVE DELETE for authenticated (RESTRICTIVE will filter to owner)
CREATE POLICY "permissive_delete_contact_messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (true);
