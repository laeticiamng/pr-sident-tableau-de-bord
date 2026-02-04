-- Fix RLS policies: Add PERMISSIVE SELECT policies for user_roles and role_permissions
-- These are needed alongside the RESTRICTIVE policies to actually allow access

-- First, drop the restrictive policies that are causing issues
DROP POLICY IF EXISTS "Users can view their own roles or is owner" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view permissions for their roles or is owner" ON public.role_permissions;

-- Re-create as PERMISSIVE policies (default)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) OR is_owner());

CREATE POLICY "Users can view permissions for their roles"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (is_owner() OR (role IN (
  SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = auth.uid()
)));