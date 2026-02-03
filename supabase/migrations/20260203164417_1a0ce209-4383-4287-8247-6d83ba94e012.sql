-- Migration 2: Créer la table role_permissions et les fonctions

-- 1. Créer une table de permissions granulaires
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- 2. Enable RLS sur role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 3. Policies pour role_permissions (owner only)
CREATE POLICY "Owner can manage role_permissions"
  ON public.role_permissions
  FOR ALL
  USING (public.is_owner());

-- 4. Insérer les permissions par défaut pour chaque rôle

-- Admin permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('admin', 'dashboard', 'view'),
  ('admin', 'dashboard', 'edit'),
  ('admin', 'users', 'view'),
  ('admin', 'users', 'edit'),
  ('admin', 'runs', 'view'),
  ('admin', 'runs', 'create'),
  ('admin', 'platforms', 'view'),
  ('admin', 'platforms', 'edit'),
  ('admin', 'audit', 'view'),
  ('admin', 'approvals', 'view'),
  ('admin', 'approvals', 'decide');

-- Finance permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('finance', 'dashboard', 'view'),
  ('finance', 'finance', 'view'),
  ('finance', 'finance', 'edit'),
  ('finance', 'runs', 'view'),
  ('finance', 'runs', 'create'),
  ('finance', 'platforms', 'view'),
  ('finance', 'audit', 'view');

-- Marketing permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('marketing', 'dashboard', 'view'),
  ('marketing', 'marketing', 'view'),
  ('marketing', 'marketing', 'edit'),
  ('marketing', 'runs', 'view'),
  ('marketing', 'runs', 'create'),
  ('marketing', 'platforms', 'view');

-- Support permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('support', 'dashboard', 'view'),
  ('support', 'support', 'view'),
  ('support', 'support', 'edit'),
  ('support', 'runs', 'view'),
  ('support', 'platforms', 'view');

-- Product permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('product', 'dashboard', 'view'),
  ('product', 'product', 'view'),
  ('product', 'product', 'edit'),
  ('product', 'runs', 'view'),
  ('product', 'runs', 'create'),
  ('product', 'platforms', 'view'),
  ('product', 'platforms', 'edit');

-- Engineering permissions
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('engineering', 'dashboard', 'view'),
  ('engineering', 'engineering', 'view'),
  ('engineering', 'engineering', 'edit'),
  ('engineering', 'runs', 'view'),
  ('engineering', 'runs', 'create'),
  ('engineering', 'platforms', 'view'),
  ('engineering', 'platforms', 'edit'),
  ('engineering', 'diagnostics', 'view'),
  ('engineering', 'audit', 'view');

-- Viewer permissions (read-only)
INSERT INTO public.role_permissions (role, resource, action) VALUES
  ('viewer', 'dashboard', 'view'),
  ('viewer', 'platforms', 'view'),
  ('viewer', 'runs', 'view');

-- 5. Créer une fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _resource TEXT,
  _action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Owner has all permissions
  IF public.has_role(_user_id, 'owner') THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has any role with the required permission
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id
      AND rp.resource = _resource
      AND rp.action = _action
  );
END;
$$;

-- 6. Créer une fonction pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(resource TEXT, action TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Owner has all permissions
  IF public.has_role(_user_id, 'owner') THEN
    RETURN QUERY
    SELECT DISTINCT rp.resource, rp.action
    FROM public.role_permissions rp;
    RETURN;
  END IF;
  
  -- Return permissions based on user's roles
  RETURN QUERY
  SELECT DISTINCT rp.resource, rp.action
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  WHERE ur.user_id = _user_id;
END;
$$;