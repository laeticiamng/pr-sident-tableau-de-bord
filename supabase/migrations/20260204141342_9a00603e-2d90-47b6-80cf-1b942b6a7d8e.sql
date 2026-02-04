-- Ajouter des politiques RESTRICTIVE explicites pour bloquer INSERT/UPDATE/DELETE pour les non-owners
-- Ces politiques s'ajoutent aux politiques PERMISSIVE existantes pour renforcer la sécurité

-- user_roles: bloquer INSERT pour non-owners
CREATE POLICY "Deny non-owner insert on user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (is_owner());

-- user_roles: bloquer UPDATE pour non-owners
CREATE POLICY "Deny non-owner update on user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (is_owner())
WITH CHECK (is_owner());

-- user_roles: bloquer DELETE pour non-owners
CREATE POLICY "Deny non-owner delete on user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (is_owner());

-- role_permissions: bloquer INSERT pour non-owners
CREATE POLICY "Deny non-owner insert on role_permissions"
ON public.role_permissions
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (is_owner());

-- role_permissions: bloquer UPDATE pour non-owners
CREATE POLICY "Deny non-owner update on role_permissions"
ON public.role_permissions
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (is_owner())
WITH CHECK (is_owner());

-- role_permissions: bloquer DELETE pour non-owners
CREATE POLICY "Deny non-owner delete on role_permissions"
ON public.role_permissions
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (is_owner());