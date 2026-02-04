-- Fix conflicting RLS policies on user_roles and role_permissions
-- Remove the overly permissive policies that allow any authenticated user to see all roles/permissions

-- Drop the conflicting policies on user_roles
DROP POLICY IF EXISTS "Require authentication for user_roles" ON public.user_roles;

-- Drop the conflicting policies on role_permissions  
DROP POLICY IF EXISTS "Require authentication for role_permissions" ON public.role_permissions;

-- The remaining policies already properly restrict access:
-- - "Users can view their own roles or is owner" on user_roles
-- - "Users can view permissions for their roles or is owner" on role_permissions
-- - "Owner can manage all roles" on user_roles
-- - "Owner can manage permissions" on role_permissions