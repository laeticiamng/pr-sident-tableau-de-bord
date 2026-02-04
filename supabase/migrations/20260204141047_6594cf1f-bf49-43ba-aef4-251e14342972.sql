-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner manages all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Owner manages permissions" ON public.role_permissions;

-- Recréer les politiques avec PERMISSIVE explicite

-- user_roles: bloquer l'accès public/anon
CREATE POLICY "Deny anon access to user_roles"
ON public.user_roles
AS PERMISSIVE
FOR SELECT
TO anon
USING (false);

-- user_roles: lecture pour les utilisateurs authentifiés (leur propre rôle ou owner)
CREATE POLICY "Authenticated users view own roles"
ON public.user_roles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_owner());

-- user_roles: gestion complète pour owner uniquement
CREATE POLICY "Owner manages user roles"
ON public.user_roles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_owner())
WITH CHECK (is_owner());

-- role_permissions: bloquer l'accès public/anon
CREATE POLICY "Deny anon access to role_permissions"
ON public.role_permissions
AS PERMISSIVE
FOR SELECT
TO anon
USING (false);

-- role_permissions: lecture pour les utilisateurs authentifiés (leurs permissions ou owner)
CREATE POLICY "Authenticated users view permissions"
ON public.role_permissions
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  is_owner() OR 
  role IN (SELECT ur.role FROM user_roles ur WHERE ur.user_id = auth.uid())
);

-- role_permissions: gestion complète pour owner uniquement
CREATE POLICY "Owner manages role permissions"
ON public.role_permissions
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_owner())
WITH CHECK (is_owner());