-- Remove the overly permissive policies that were added
-- The RESTRICTIVE policies already properly handle access control
DROP POLICY IF EXISTS "Allow authenticated users to query user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to query role_permissions" ON public.role_permissions;