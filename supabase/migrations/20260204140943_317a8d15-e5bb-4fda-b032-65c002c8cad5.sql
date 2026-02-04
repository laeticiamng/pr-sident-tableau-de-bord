-- Ajouter des politiques PERMISSIVE par défaut qui bloquent l'accès public
-- Ces politiques servent de base pour que les politiques RESTRICTIVE fonctionnent correctement

-- user_roles: politique PERMISSIVE par défaut qui bloque tout
CREATE POLICY "Block public access to user_roles"
ON public.user_roles
FOR SELECT
TO public
USING (false);

-- role_permissions: politique PERMISSIVE par défaut qui bloque tout
CREATE POLICY "Block public access to role_permissions"
ON public.role_permissions
FOR SELECT
TO public
USING (false);