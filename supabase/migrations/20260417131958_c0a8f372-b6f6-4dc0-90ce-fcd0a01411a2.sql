-- ============================================================
-- HORIZON 0 — Durcissement sécurité critique (2026-04-17)
-- ============================================================

-- 1) Purge des politiques permissives résiduelles sur user_roles
DROP POLICY IF EXISTS "permissive_insert_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "permissive_update_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "permissive_delete_user_roles" ON public.user_roles;

-- 2) Purge des politiques permissives résiduelles sur role_permissions
DROP POLICY IF EXISTS "permissive_insert_role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "permissive_update_role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "permissive_delete_role_permissions" ON public.role_permissions;

-- 3) Purge politique analytics_events doublon (la "Anyone can insert analytics events" reste active)
DROP POLICY IF EXISTS "permissive_insert_analytics" ON public.analytics_events;

-- 4) Immuabilité du journal d'audit hq.audit_logs
--    Aucun UPDATE / DELETE possible, même par owner (forensique)
REVOKE UPDATE, DELETE ON hq.audit_logs FROM authenticated, anon, service_role, public;

-- Politique RESTRICTIVE pour bloquer toute mutation au niveau RLS également
DROP POLICY IF EXISTS "audit_logs_immutable_no_update" ON hq.audit_logs;
CREATE POLICY "audit_logs_immutable_no_update"
ON hq.audit_logs
AS RESTRICTIVE
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "audit_logs_immutable_no_delete" ON hq.audit_logs;
CREATE POLICY "audit_logs_immutable_no_delete"
ON hq.audit_logs
AS RESTRICTIVE
FOR DELETE
TO authenticated, anon
USING (false);

-- 5) Log de l'opération dans le journal d'audit (avant qu'il devienne immuable côté écriture)
INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, details)
VALUES (
  'system',
  'horizon-0-migration',
  'security.hardening.h0',
  'rls_policies',
  jsonb_build_object(
    'horizon', 'H0',
    'date', '2026-04-17',
    'changes', jsonb_build_array(
      'dropped_permissive_user_roles_x3',
      'dropped_permissive_role_permissions_x3',
      'dropped_permissive_analytics_events_x1',
      'audit_logs_immutable_revoked_update_delete',
      'audit_logs_restrictive_policies_added'
    )
  )
);