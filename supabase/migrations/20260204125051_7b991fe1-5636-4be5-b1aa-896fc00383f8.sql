-- Add PERMISSIVE policies to user_roles and role_permissions
-- to properly control access and prevent default public read when no RESTRICTIVE policies match

-- Add PERMISSIVE policy for user_roles that allows authenticated users to query
-- (the RESTRICTIVE policies will then filter what they can see)
CREATE POLICY "Allow authenticated users to query user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- Add PERMISSIVE policy for role_permissions that allows authenticated users to query
-- (the RESTRICTIVE policies will then filter what they can see)
CREATE POLICY "Allow authenticated users to query role_permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);