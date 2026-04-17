-- Purge finale : politiques permissives mutation sur contact_messages
DROP POLICY IF EXISTS "permissive_update_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "permissive_delete_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "permissive_insert_contact_messages" ON public.contact_messages;

-- Trace dans le journal d'audit
INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, details)
VALUES (
  'system',
  'horizon-0-migration',
  'security.hardening.h0.followup',
  'rls_policies',
  jsonb_build_object(
    'horizon', 'H0',
    'changes', jsonb_build_array('dropped_permissive_contact_messages_mutations')
  )
);