-- Supprimer les anciennes politiques RESTRICTIVE
DROP POLICY IF EXISTS "Owner can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner can manage permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Users can view permissions for their roles" ON public.role_permissions;

-- Recréer les politiques en PERMISSIVE (par défaut)
-- user_roles: lecture pour l'utilisateur lui-même ou owner
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

-- role_permissions: lecture pour owner ou utilisateurs avec le rôle correspondant
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