-- ============================================
-- FONCTIONS RPC POUR LE SCHÉMA HQ
-- ============================================

-- Fonction pour récupérer toutes les plateformes
CREATE OR REPLACE FUNCTION public.get_all_hq_platforms()
RETURNS TABLE (
  id UUID,
  key TEXT,
  name TEXT,
  description TEXT,
  github_url TEXT,
  status TEXT,
  status_reason TEXT,
  uptime_percent NUMERIC,
  last_release_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  -- Vérifier que l'utilisateur est owner
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id, p.key, p.name, p.description, p.github_url,
    p.status, p.status_reason, p.uptime_percent,
    p.last_release_at, p.created_at, p.updated_at
  FROM hq.platforms p
  ORDER BY p.name;
END;
$$;

-- Fonction pour récupérer une plateforme par clé
CREATE OR REPLACE FUNCTION public.get_hq_platform(platform_key_param TEXT)
RETURNS TABLE (
  id UUID,
  key TEXT,
  name TEXT,
  description TEXT,
  github_url TEXT,
  status TEXT,
  status_reason TEXT,
  uptime_percent NUMERIC,
  last_release_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id, p.key, p.name, p.description, p.github_url,
    p.status, p.status_reason, p.uptime_percent,
    p.last_release_at, p.created_at, p.updated_at
  FROM hq.platforms p
  WHERE p.key = platform_key_param;
END;
$$;

-- Fonction pour récupérer les rôles organisationnels
CREATE OR REPLACE FUNCTION public.get_hq_org_roles()
RETURNS TABLE (
  id UUID,
  key TEXT,
  title TEXT,
  title_fr TEXT,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT r.id, r.key, r.title, r.title_fr, r.category, r.description, r.created_at
  FROM hq.org_roles r
  ORDER BY r.category, r.title_fr;
END;
$$;

-- Fonction pour récupérer les agents
CREATE OR REPLACE FUNCTION public.get_hq_agents()
RETURNS TABLE (
  id UUID,
  role_key TEXT,
  name TEXT,
  is_enabled BOOLEAN,
  model_preference TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  role_title_fr TEXT,
  role_category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id, a.role_key, a.name, a.is_enabled, a.model_preference,
    a.created_at, a.updated_at, r.title_fr, r.category
  FROM hq.agents a
  JOIN hq.org_roles r ON r.key = a.role_key
  ORDER BY r.category, r.title_fr;
END;
$$;

-- Fonction pour récupérer les actions en attente
CREATE OR REPLACE FUNCTION public.get_hq_pending_actions()
RETURNS TABLE (
  id UUID,
  run_id UUID,
  agent_id UUID,
  action_type TEXT,
  title TEXT,
  description TEXT,
  payload JSONB,
  risk_level TEXT,
  requires_approval BOOLEAN,
  status TEXT,
  created_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id, a.run_id, a.agent_id, a.action_type, a.title,
    a.description, a.payload, a.risk_level::TEXT, a.requires_approval,
    a.status, a.created_at, a.executed_at
  FROM hq.actions a
  WHERE a.status = 'pending' AND a.requires_approval = true
  ORDER BY a.created_at DESC;
END;
$$;

-- Fonction pour récupérer les runs récents
CREATE OR REPLACE FUNCTION public.get_hq_recent_runs(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  run_type TEXT,
  owner_requested BOOLEAN,
  platform_key TEXT,
  director_agent_id UUID,
  status TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  executive_summary TEXT,
  detailed_appendix JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT 
    r.id, r.run_type, r.owner_requested, r.platform_key,
    r.director_agent_id, r.status::TEXT, r.started_at, r.completed_at,
    r.executive_summary, r.detailed_appendix, r.created_at
  FROM hq.runs r
  ORDER BY r.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Fonction pour récupérer les audit logs
CREATE OR REPLACE FUNCTION public.get_hq_audit_logs(limit_count INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  actor_type TEXT,
  actor_id TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  RETURN QUERY
  SELECT 
    l.id, l.actor_type, l.actor_id, l.action,
    l.resource_type, l.resource_id, l.details, l.ip_address, l.created_at
  FROM hq.audit_logs l
  ORDER BY l.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Fonction pour récupérer la config système
CREATE OR REPLACE FUNCTION public.get_hq_system_config(config_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  SELECT c.value INTO result
  FROM hq.system_config c
  WHERE c.key = config_key;
  
  RETURN result;
END;
$$;

-- Fonction pour insérer un run
CREATE OR REPLACE FUNCTION public.insert_hq_run(
  p_run_type TEXT,
  p_platform_key TEXT DEFAULT NULL,
  p_owner_requested BOOLEAN DEFAULT TRUE,
  p_status TEXT DEFAULT 'completed',
  p_executive_summary TEXT DEFAULT NULL,
  p_detailed_appendix JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  INSERT INTO hq.runs (
    run_type, platform_key, owner_requested, status,
    started_at, completed_at, executive_summary, detailed_appendix
  ) VALUES (
    p_run_type, p_platform_key, p_owner_requested, p_status::hq.run_status,
    now(), now(), p_executive_summary, p_detailed_appendix
  )
  RETURNING id INTO new_id;
  
  -- Log l'action
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'run.created', 'run', new_id::TEXT, 
          jsonb_build_object('run_type', p_run_type, 'platform_key', p_platform_key));
  
  RETURN new_id;
END;
$$;

-- Fonction pour approuver/rejeter une action
CREATE OR REPLACE FUNCTION public.approve_hq_action(
  p_action_id UUID,
  p_decision TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Décision invalide';
  END IF;
  
  -- Mettre à jour le statut de l'action
  UPDATE hq.actions SET status = p_decision WHERE id = p_action_id;
  
  -- Créer l'enregistrement d'approbation
  INSERT INTO hq.approvals (action_id, owner_id, decision, reason)
  VALUES (p_action_id, auth.uid(), p_decision, p_reason);
  
  -- Log l'action
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'action.' || p_decision, 'action', p_action_id::TEXT,
          jsonb_build_object('reason', p_reason));
  
  RETURN TRUE;
END;
$$;

-- Fonction pour mettre à jour la config système
CREATE OR REPLACE FUNCTION public.update_hq_system_config(
  p_key TEXT,
  p_value JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  UPDATE hq.system_config SET value = p_value, updated_at = now() WHERE key = p_key;
  
  -- Log l'action
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'config.updated', 'system_config', p_key,
          jsonb_build_object('new_value', p_value));
  
  RETURN TRUE;
END;
$$;