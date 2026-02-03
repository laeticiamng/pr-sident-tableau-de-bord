-- Fix overly permissive RLS policies on role_permissions
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.role_permissions;

-- Create a more restrictive policy: users can only view permissions for their own roles
CREATE POLICY "Users can view their own role permissions" 
ON public.role_permissions 
FOR SELECT 
TO authenticated
USING (
  role IN (
    SELECT ur.role 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
  )
);

-- Keep the owner policy as is (owners can manage all permissions)