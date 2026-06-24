
-- 1) Fix has_org_access to honor the _user_id parameter
CREATE OR REPLACE FUNCTION public.has_org_access(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  );
$$;

-- 2) Revoke EXECUTE from PUBLIC (and anon) on all SECURITY DEFINER functions in public.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %I.%I(%s) FROM PUBLIC', r.nspname, r.proname, r.args);
    EXECUTE format('REVOKE ALL ON FUNCTION %I.%I(%s) FROM anon', r.nspname, r.proname, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO service_role', r.nspname, r.proname, r.args);
  END LOOP;
END$$;

-- 3) Restrict internal helpers and edge-function-only RPCs from authenticated as well.
--    These are not meant to be called directly from the client.
DO $$
DECLARE
  fn text;
  internal_fns text[] := ARRAY[
    'check_ip_rate_limit(text,integer,integer)',
    'get_active_push_subscriptions()',
    'upsert_hq_morning_digest(text,jsonb,text[],text,integer,text)',
    'insert_hq_log(text,text,text,jsonb,uuid)',
    'get_dlq_pending(integer)',
    'mark_dlq_attempt(uuid,text,text)',
    'enqueue_dlq_run(uuid,text,text,jsonb,text)',
    'insert_studio_public_submission(text,text,text,text,text,text,text,text,inet,text)',
    'purge_rate_limit_buckets()',
    'get_user_permissions(uuid)',
    'current_user_org_id()'
  ];
BEGIN
  FOREACH fn IN ARRAY internal_fns LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      -- skip if function signature mismatch
      NULL;
    END;
  END LOOP;
END$$;

-- 4) Re-grant EXECUTE to authenticated for RPCs the client app calls via supabase.rpc().
DO $$
DECLARE
  fn text;
  client_fns text[] := ARRAY[
    'is_owner()',
    'has_role(uuid,app_role)',
    'has_org_access(uuid,uuid)',
    'has_permission(uuid,text,text)',
    'get_all_hq_platforms()',
    'get_hq_platform(text)',
    'get_hq_agents()',
    'get_hq_org_roles()',
    'get_hq_audit_logs(integer)',
    'get_hq_logs(integer,text,text)',
    'get_hq_pending_actions()',
    'get_hq_recent_runs(integer)',
    'get_hq_system_config(text)',
    'update_hq_system_config(text,jsonb)',
    'approve_hq_action(uuid,text,text)',
    'insert_hq_run(text,text,boolean,text,text,jsonb)',
    'get_hq_ai_budget_status()',
    'get_hq_governance_dashboard()',
    'get_hq_slo_status()',
    'get_hq_top_run_costs(integer)',
    'get_hq_run_duration_metrics()',
    'get_hq_dlq_entries(integer)',
    'get_hq_morning_digest(date)',
    'get_hq_conversations(integer)',
    'get_hq_chat_messages(uuid)',
    'add_hq_chat_message(uuid,text,text)',
    'create_hq_conversation(text)',
    'delete_hq_conversation(uuid)',
    'get_hq_journal_entries(integer)',
    'create_hq_journal_entry(text,text,text,text[],jsonb)',
    'update_hq_journal_entry(uuid,text,text,text[],jsonb,boolean)',
    'delete_hq_journal_entry(uuid)',
    'purge_old_hq_logs(integer)',
    'save_push_subscription(text,text,text,text,text)',
    'remove_push_subscription(text)',
    'get_studio_overview()',
    'list_studio_opportunities()',
    'create_studio_opportunity(text,text,text,text,text,text)',
    'list_studio_calls()',
    'create_studio_call(text,text,text,text,date,text,text,text)',
    'list_studio_blueprints()',
    'list_studio_deals()',
    'list_studio_advisory()',
    'list_studio_documents()',
    'list_studio_approvals(text)',
    'decide_studio_approval(uuid,text,text)',
    'request_studio_approval(text,text,jsonb,text,uuid,text,text)',
    'list_studio_public_submissions(text)',
    'convert_studio_submission_to_opportunity(uuid)',
    'update_studio_submission_status(uuid,text)',
    'get_studio_audit_trail(text,uuid)'
  ];
BEGIN
  FOREACH fn IN ARRAY client_fns LOOP
    BEGIN
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END LOOP;
END$$;
