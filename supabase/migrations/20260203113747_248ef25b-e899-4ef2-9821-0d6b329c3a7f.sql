-- ============================================
-- EMOTIONSCARE HQ - Schéma de base de données
-- ============================================

-- 1. Créer le schéma hq dédié
CREATE SCHEMA IF NOT EXISTS hq;

-- 2. Enum pour les rôles d'application
CREATE TYPE public.app_role AS ENUM ('owner', 'admin');

-- 3. Table des rôles utilisateurs (sécurité)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Fonction de vérification de rôle (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Fonction pour vérifier si l'utilisateur est owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'owner')
$$;

-- ============================================
-- TABLES HQ
-- ============================================

-- Profil entreprise (ligne unique)
CREATE TABLE hq.company_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL DEFAULT 'EMOTIONSCARE SASU',
  form TEXT NOT NULL DEFAULT 'SASU',
  siren TEXT NOT NULL DEFAULT '944 505 445',
  siret TEXT NOT NULL DEFAULT '944 505 445 00014',
  vat TEXT NOT NULL DEFAULT 'FR71944505445',
  address TEXT NOT NULL DEFAULT 'APPARTEMENT 1, 5 RUE CAUDRON, 80000 AMIENS',
  activity TEXT NOT NULL DEFAULT '58.29C — Édition de logiciels applicatifs',
  capital TEXT NOT NULL DEFAULT '100,00 €',
  creation_date DATE NOT NULL DEFAULT '2025-05-07',
  rcs TEXT NOT NULL DEFAULT 'Amiens (inscrit le 21/05/2025)',
  president TEXT NOT NULL DEFAULT 'Motongane Laeticia',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plateformes (exactement 5, immuable)
CREATE TABLE hq.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  status TEXT NOT NULL DEFAULT 'green' CHECK (status IN ('green', 'amber', 'red')),
  status_reason TEXT,
  uptime_percent NUMERIC(5,2) DEFAULT 99.9,
  last_release_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rôles organisationnels (catalogue fixe)
CREATE TABLE hq.org_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('c_suite', 'function_head', 'platform_gm')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agents IA
CREATE TABLE hq.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key TEXT NOT NULL REFERENCES hq.org_roles(key),
  name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  model_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scopes des agents (par plateforme)
CREATE TABLE hq.agent_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES hq.agents(id) ON DELETE CASCADE,
  platform_key TEXT REFERENCES hq.platforms(key),
  capabilities JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Types de runs
CREATE TYPE hq.run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE hq.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Runs (Executive Runs)
CREATE TABLE hq.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL,
  owner_requested BOOLEAN NOT NULL DEFAULT false,
  platform_key TEXT REFERENCES hq.platforms(key),
  director_agent_id UUID REFERENCES hq.agents(id),
  status hq.run_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  executive_summary TEXT,
  detailed_appendix JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Étapes de run
CREATE TABLE hq.run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES hq.runs(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status hq.run_status NOT NULL DEFAULT 'pending',
  output JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evidence bundle
CREATE TABLE hq.run_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES hq.runs(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  data JSONB NOT NULL,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Actions proposées
CREATE TABLE hq.actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES hq.runs(id),
  agent_id UUID REFERENCES hq.agents(id),
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB,
  risk_level hq.risk_level NOT NULL DEFAULT 'medium',
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ
);

-- Approbations Owner
CREATE TABLE hq.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES hq.actions(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reason TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs (append-only)
CREATE TABLE hq.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('owner', 'agent', 'system')),
  actor_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Incidents plateformes
CREATE TABLE hq.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key TEXT NOT NULL REFERENCES hq.platforms(key),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Releases
CREATE TABLE hq.releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key TEXT NOT NULL REFERENCES hq.platforms(key),
  version TEXT NOT NULL,
  release_type TEXT NOT NULL DEFAULT 'minor' CHECK (release_type IN ('patch', 'minor', 'major')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'staging', 'released', 'rolled_back')),
  changelog TEXT,
  gate_checks JSONB,
  planned_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campagnes marketing
CREATE TABLE hq.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform_key TEXT REFERENCES hq.platforms(key),
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC(10,2),
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pipeline commercial
CREATE TABLE hq.sales_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key TEXT REFERENCES hq.platforms(key),
  deal_name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  value NUMERIC(10,2),
  contact_name TEXT,
  contact_email TEXT,
  next_step TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Financials
CREATE TABLE hq.financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key TEXT REFERENCES hq.platforms(key),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue NUMERIC(12,2) DEFAULT 0,
  costs NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Initiatives produit
CREATE TABLE hq.product_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key TEXT REFERENCES hq.platforms(key),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'planned', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  target_date DATE,
  okr_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets support
CREATE TABLE hq.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key TEXT REFERENCES hq.platforms(key),
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  requester_email TEXT,
  assigned_agent_id UUID REFERENCES hq.agents(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Résumés de réunions
CREATE TABLE hq.meeting_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES hq.runs(id),
  meeting_type TEXT NOT NULL,
  title TEXT NOT NULL,
  attendees JSONB,
  key_points JSONB,
  decisions JSONB,
  action_items JSONB,
  full_summary TEXT,
  meeting_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contenu public (marketing)
CREATE TABLE hq.public_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  body TEXT,
  metadata JSONB,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuration système
CREATE TABLE hq.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_roles: seul owner peut voir/modifier
CREATE POLICY "Owner peut voir les rôles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_owner());

CREATE POLICY "Owner peut gérer les rôles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_owner());

-- Activer RLS sur toutes les tables hq
ALTER TABLE hq.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.org_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.agent_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.run_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.sales_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.product_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.meeting_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.public_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.system_config ENABLE ROW LEVEL SECURITY;

-- Policies: Owner a accès complet à toutes les tables hq
CREATE POLICY "Owner accès complet" ON hq.company_profile FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.platforms FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.org_roles FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.agents FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.agent_scopes FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.runs FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.run_steps FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.run_evidence FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.actions FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.approvals FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.audit_logs FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.incidents FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.releases FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.campaigns FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.sales_pipeline FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.financials FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.product_initiatives FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.support_tickets FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.meeting_summaries FOR ALL TO authenticated USING (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.system_config FOR ALL TO authenticated USING (public.is_owner());

-- Public content: anon peut lire le contenu publié
CREATE POLICY "Public peut lire contenu publié" ON hq.public_content
  FOR SELECT TO anon
  USING (is_published = true);

-- Audit logs: append-only (pas de update/delete même pour owner)
CREATE POLICY "Owner peut insérer audit" ON hq.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_owner());

-- ============================================
-- TRIGGERS
-- ============================================

-- Fonction de mise à jour updated_at
CREATE OR REPLACE FUNCTION hq.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables avec updated_at
CREATE TRIGGER update_company_profile_updated_at BEFORE UPDATE ON hq.company_profile
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON hq.platforms
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON hq.agents
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON hq.campaigns
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();
CREATE TRIGGER update_sales_pipeline_updated_at BEFORE UPDATE ON hq.sales_pipeline
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();
CREATE TRIGGER update_product_initiatives_updated_at BEFORE UPDATE ON hq.product_initiatives
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();
CREATE TRIGGER update_public_content_updated_at BEFORE UPDATE ON hq.public_content
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON hq.system_config
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();