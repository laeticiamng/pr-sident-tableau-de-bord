-- Supprimer les politiques qui causent des conflits
DROP POLICY IF EXISTS "Block public access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block public access to role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner manages all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Owner manages permissions" ON public.role_permissions;

-- Recréer les politiques correctement en mode PERMISSIVE uniquement

-- user_roles: lecture pour les utilisateurs authentifiés (leur propre rôle ou owner)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_owner());

-- user_roles: gestion complète pour owner uniquement
CREATE POLICY "Owner manages all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (is_owner())
WITH CHECK (is_owner());

-- role_permissions: lecture pour les utilisateurs authentifiés (leurs permissions ou owner)
CREATE POLICY "Users can view their role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (
  is_owner() OR 
  role IN (SELECT ur.role FROM user_roles ur WHERE ur.user_id = auth.uid())
);

-- role_permissions: gestion complète pour owner uniquement
CREATE POLICY "Owner manages permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (is_owner())
WITH CHECK (is_owner());