-- Corriger les politiques RLS pour user_roles et role_permissions
-- Ces tables exposent actuellement des informations sensibles à tous les utilisateurs authentifiés

-- 1. Supprimer les anciennes politiques permissives
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role permissions" ON public.role_permissions;

-- 2. Créer des politiques restrictives correctes pour user_roles
-- Les utilisateurs ne peuvent voir QUE leurs propres rôles
CREATE POLICY "Users can only view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Créer des politiques restrictives pour role_permissions
-- Les utilisateurs ne peuvent voir QUE les permissions de leurs propres rôles
CREATE POLICY "Users can only view permissions for their own roles"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (
  role IN (
    SELECT role FROM public.user_roles WHERE user_id = auth.uid()
  )
);

-- 4. Ajouter des politiques pour les owners (accès complet)
CREATE POLICY "Owners can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_owner());

CREATE POLICY "Owners can view all permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (public.is_owner());