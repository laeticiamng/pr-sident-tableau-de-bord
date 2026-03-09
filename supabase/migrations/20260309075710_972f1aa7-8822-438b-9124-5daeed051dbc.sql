-- Drop 7 overly broad permissive policies that bypass owner-only restrictions
-- These policies use USING(true) which combined with OR logic nullifies the original filters

DROP POLICY IF EXISTS "permissive_select_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "permissive_select_role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "permissive_select_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "permissive_delete_analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "permissive_select_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "permissive_update_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "permissive_delete_contact_messages" ON public.contact_messages;