-- Fix RLS policies for user_roles table
-- Add permissive policies that work with the existing restrictive ones

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Owner peut gérer les rôles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner peut voir les rôles" ON public.user_roles;

-- Create permissive policy for owners to manage roles
CREATE POLICY "Owner can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- Create permissive policy for users to view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix RLS policies for role_permissions table
-- Drop existing policy
DROP POLICY IF EXISTS "Owner can manage role_permissions" ON public.role_permissions;

-- Create permissive policy for owners to manage permissions
CREATE POLICY "Owner can manage permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- Create permissive policy for authenticated users to view permissions
-- This is needed for the permission checking functions to work
CREATE POLICY "Authenticated users can view permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);