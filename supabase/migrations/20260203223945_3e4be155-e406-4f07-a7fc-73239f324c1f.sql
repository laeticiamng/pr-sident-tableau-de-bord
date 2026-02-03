-- Corriger les politiques RLS : utiliser PERMISSIVE au lieu de RESTRICTIVE
-- Les politiques RESTRICTIVE exigent que TOUTES passent, ce qui bloque les utilisateurs normaux

-- 1. Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Users can only view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can only view permissions for their own roles" ON public.role_permissions;
DROP POLICY IF EXISTS "Owners can view all permissions" ON public.role_permissions;

-- 2. Recréer les politiques avec logique OR (utiliser une seule politique avec OR)
-- Pour user_roles : un utilisateur peut voir ses propres rôles OU est owner
CREATE POLICY "Users can view their own roles or is owner"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_owner());

-- Pour role_permissions : un utilisateur peut voir les permissions de ses rôles OU est owner
CREATE POLICY "Users can view permissions for their roles or is owner"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (
  public.is_owner() OR role IN (
    SELECT role FROM public.user_roles WHERE user_id = auth.uid()
  )
);