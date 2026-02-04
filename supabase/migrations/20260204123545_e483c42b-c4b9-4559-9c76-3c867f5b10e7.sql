-- Fix critical security vulnerability: Require authentication for user_roles table
-- Prevents anonymous/public access to role assignments

CREATE POLICY "Require authentication for user_roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix critical security vulnerability: Require authentication for role_permissions table  
-- Prevents anonymous/public access to permission configurations

CREATE POLICY "Require authentication for role_permissions"
ON public.role_permissions
FOR SELECT
USING (auth.uid() IS NOT NULL);