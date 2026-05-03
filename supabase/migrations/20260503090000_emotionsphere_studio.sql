-- ============================================
-- EMOTIONSPHERE STUDIO — Strategic studio module
-- ============================================
-- Studio d'architecture stratégique : opportunités, appels à projets,
-- blueprints 360°, equity deals, advisory, documents.
-- All tables live in the hq schema and inherit the existing owner-only
-- RLS pattern (public.is_owner()) used across the rest of the HQ schema.

-- ──────────────────────────────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hq.studio_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  domain TEXT,
  source_type TEXT,
  source_url TEXT,
  description TEXT,
  problem_statement TEXT,
  opportunity_score INTEGER CHECK (opportunity_score IS NULL OR (opportunity_score >= 0 AND opportunity_score <= 100)),
  strategic_value_score INTEGER CHECK (strategic_value_score IS NULL OR (strategic_value_score >= 0 AND strategic_value_score <= 100)),
  execution_risk_score INTEGER CHECK (execution_risk_score IS NULL OR (execution_risk_score >= 0 AND execution_risk_score <= 100)),
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN (
    'idea', 'qualified', 'blueprint_in_progress', 'ready', 'deal_proposed',
    'deal_signed', 'advisory', 'archived', 'rejected'
  )),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_opportunities_title_chk CHECK (char_length(title) BETWEEN 1 AND 280)
);

CREATE INDEX IF NOT EXISTS studio_opportunities_status_idx
  ON hq.studio_opportunities (status, created_at DESC);
CREATE INDEX IF NOT EXISTS studio_opportunities_created_at_idx
  ON hq.studio_opportunities (created_at DESC);

CREATE TABLE IF NOT EXISTS hq.studio_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN (
    'appel_a_projets', 'appel_offres', 'ami', 'subvention', 'concours',
    'marche_public', 'marche_prive'
  )),
  issuer TEXT,
  source_url TEXT,
  deadline DATE,
  domain TEXT,
  eligibility TEXT,
  selection_criteria JSONB DEFAULT '[]'::jsonb,
  required_documents JSONB DEFAULT '[]'::jsonb,
  estimated_budget TEXT,
  ai_analysis JSONB,
  status TEXT NOT NULL DEFAULT 'to_analyze' CHECK (status IN (
    'to_analyze', 'relevant', 'not_relevant', 'blueprint_in_progress',
    'response_in_preparation', 'submitted', 'won', 'lost', 'recycle'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_calls_title_chk CHECK (char_length(title) BETWEEN 1 AND 280)
);

CREATE INDEX IF NOT EXISTS studio_calls_status_idx
  ON hq.studio_calls (status, created_at DESC);
CREATE INDEX IF NOT EXISTS studio_calls_deadline_idx
  ON hq.studio_calls (deadline);

CREATE TABLE IF NOT EXISTS hq.studio_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES hq.studio_opportunities(id) ON DELETE SET NULL,
  call_id UUID REFERENCES hq.studio_calls(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  problem JSONB DEFAULT '{}'::jsonb,
  opportunity JSONB DEFAULT '{}'::jsonb,
  solution JSONB DEFAULT '{}'::jsonb,
  targets JSONB DEFAULT '{}'::jsonb,
  business_model JSONB DEFAULT '{}'::jsonb,
  partners JSONB DEFAULT '{}'::jsonb,
  deployment_plan JSONB DEFAULT '{}'::jsonb,
  kpis JSONB DEFAULT '{}'::jsonb,
  risks JSONB DEFAULT '{}'::jsonb,
  pitch JSONB DEFAULT '{}'::jsonb,
  emotionsphere_role JSONB DEFAULT '{}'::jsonb,
  deal_recommendation JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'in_review', 'finalized', 'sent', 'archived'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_blueprints_title_chk CHECK (char_length(title) BETWEEN 1 AND 280)
);

CREATE INDEX IF NOT EXISTS studio_blueprints_status_idx
  ON hq.studio_blueprints (status, created_at DESC);
CREATE INDEX IF NOT EXISTS studio_blueprints_opportunity_idx
  ON hq.studio_blueprints (opportunity_id);
CREATE INDEX IF NOT EXISTS studio_blueprints_call_idx
  ON hq.studio_blueprints (call_id);

CREATE TABLE IF NOT EXISTS hq.studio_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES hq.studio_blueprints(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  partner_name TEXT,
  deal_type TEXT NOT NULL CHECK (deal_type IN (
    'equity_only', 'flat_plus_equity', 'success_fee_plus_equity',
    'advisory_monthly', 'bsa_advisor', 'direct_participation', 'industry_contribution', 'hybrid'
  )),
  equity_percentage_min NUMERIC(5,2),
  equity_percentage_max NUMERIC(5,2),
  recommended_percentage NUMERIC(5,2),
  cash_component NUMERIC(12,2),
  success_fee NUMERIC(12,2),
  advisory_terms TEXT,
  legal_status TEXT,
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  next_action TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'proposed', 'in_negotiation', 'accepted', 'signed', 'rejected', 'archived'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_deals_project_name_chk CHECK (char_length(project_name) BETWEEN 1 AND 280),
  CONSTRAINT studio_deals_equity_min_chk CHECK (
    equity_percentage_min IS NULL OR (equity_percentage_min >= 0 AND equity_percentage_min <= 100)
  ),
  CONSTRAINT studio_deals_equity_max_chk CHECK (
    equity_percentage_max IS NULL OR (equity_percentage_max >= 0 AND equity_percentage_max <= 100)
  )
);

CREATE INDEX IF NOT EXISTS studio_deals_status_idx
  ON hq.studio_deals (status, created_at DESC);
CREATE INDEX IF NOT EXISTS studio_deals_blueprint_idx
  ON hq.studio_deals (blueprint_id);

CREATE TABLE IF NOT EXISTS hq.studio_advisory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES hq.studio_deals(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  role TEXT,
  monthly_commitment TEXT,
  meeting_frequency TEXT,
  strategic_topics JSONB DEFAULT '[]'::jsonb,
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_advisory_project_name_chk CHECK (char_length(project_name) BETWEEN 1 AND 280)
);

CREATE INDEX IF NOT EXISTS studio_advisory_status_idx
  ON hq.studio_advisory (status, created_at DESC);

CREATE TABLE IF NOT EXISTS hq.studio_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES hq.studio_blueprints(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES hq.studio_deals(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'note_opportunity', 'blueprint_360', 'pitch_short', 'pitch_long',
    'institutional_pitch', 'advisory_proposal', 'deal_proposal',
    'legal_checklist', 'nda', 'term_sheet', 'mission_letter',
    'shareholder_pact', 'advisory_contract', 'other'
  )),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_documents_title_chk CHECK (char_length(title) BETWEEN 1 AND 280)
);

CREATE INDEX IF NOT EXISTS studio_documents_type_idx
  ON hq.studio_documents (document_type, created_at DESC);

-- ──────────────────────────────────────────────────────────────────
-- TRIGGERS — updated_at
-- ──────────────────────────────────────────────────────────────────

CREATE TRIGGER update_studio_opportunities_updated_at
  BEFORE UPDATE ON hq.studio_opportunities
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();

CREATE TRIGGER update_studio_calls_updated_at
  BEFORE UPDATE ON hq.studio_calls
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();

CREATE TRIGGER update_studio_blueprints_updated_at
  BEFORE UPDATE ON hq.studio_blueprints
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();

CREATE TRIGGER update_studio_deals_updated_at
  BEFORE UPDATE ON hq.studio_deals
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();

CREATE TRIGGER update_studio_advisory_updated_at
  BEFORE UPDATE ON hq.studio_advisory
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();

CREATE TRIGGER update_studio_documents_updated_at
  BEFORE UPDATE ON hq.studio_documents
  FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();

-- ──────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — owner-only (existing pattern)
-- ──────────────────────────────────────────────────────────────────

ALTER TABLE hq.studio_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.studio_calls         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.studio_blueprints    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.studio_deals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.studio_advisory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE hq.studio_documents     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner accès complet" ON hq.studio_opportunities
  FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.studio_calls
  FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.studio_blueprints
  FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.studio_deals
  FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.studio_advisory
  FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Owner accès complet" ON hq.studio_documents
  FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ──────────────────────────────────────────────────────────────────
-- RPC FUNCTIONS — owner-guarded reads/writes
-- ──────────────────────────────────────────────────────────────────

-- Opportunities
CREATE OR REPLACE FUNCTION public.list_studio_opportunities()
RETURNS SETOF hq.studio_opportunities
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  RETURN QUERY SELECT * FROM hq.studio_opportunities ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_studio_opportunity(
  p_title TEXT,
  p_domain TEXT DEFAULT NULL,
  p_source_type TEXT DEFAULT NULL,
  p_source_url TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_problem_statement TEXT DEFAULT NULL
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

  INSERT INTO hq.studio_opportunities (
    title, domain, source_type, source_url, description, problem_statement, created_by
  ) VALUES (
    p_title, p_domain, p_source_type, p_source_url, p_description, p_problem_statement, auth.uid()
  ) RETURNING id INTO new_id;

  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'studio.opportunity.created', 'studio_opportunity', new_id::TEXT,
          jsonb_build_object('title', p_title, 'domain', p_domain));

  RETURN new_id;
END;
$$;

-- Calls
CREATE OR REPLACE FUNCTION public.list_studio_calls()
RETURNS SETOF hq.studio_calls
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  RETURN QUERY SELECT * FROM hq.studio_calls ORDER BY COALESCE(deadline, '9999-12-31'::date), created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_studio_call(
  p_title TEXT,
  p_call_type TEXT,
  p_issuer TEXT DEFAULT NULL,
  p_source_url TEXT DEFAULT NULL,
  p_deadline DATE DEFAULT NULL,
  p_domain TEXT DEFAULT NULL,
  p_eligibility TEXT DEFAULT NULL,
  p_estimated_budget TEXT DEFAULT NULL
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

  INSERT INTO hq.studio_calls (
    title, call_type, issuer, source_url, deadline, domain, eligibility, estimated_budget
  ) VALUES (
    p_title, p_call_type, p_issuer, p_source_url, p_deadline, p_domain, p_eligibility, p_estimated_budget
  ) RETURNING id INTO new_id;

  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'studio.call.created', 'studio_call', new_id::TEXT,
          jsonb_build_object('title', p_title, 'call_type', p_call_type, 'deadline', p_deadline));

  RETURN new_id;
END;
$$;

-- Blueprints
CREATE OR REPLACE FUNCTION public.list_studio_blueprints()
RETURNS SETOF hq.studio_blueprints
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  RETURN QUERY SELECT * FROM hq.studio_blueprints ORDER BY created_at DESC;
END;
$$;

-- Deals
CREATE OR REPLACE FUNCTION public.list_studio_deals()
RETURNS SETOF hq.studio_deals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  RETURN QUERY SELECT * FROM hq.studio_deals ORDER BY created_at DESC;
END;
$$;

-- Advisory
CREATE OR REPLACE FUNCTION public.list_studio_advisory()
RETURNS SETOF hq.studio_advisory
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  RETURN QUERY SELECT * FROM hq.studio_advisory ORDER BY created_at DESC;
END;
$$;

-- Documents
CREATE OR REPLACE FUNCTION public.list_studio_documents()
RETURNS SETOF hq.studio_documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  RETURN QUERY SELECT * FROM hq.studio_documents ORDER BY created_at DESC;
END;
$$;

-- Aggregated cockpit metrics
CREATE OR REPLACE FUNCTION public.get_studio_overview()
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

  SELECT jsonb_build_object(
    'opportunities_total', (SELECT COUNT(*) FROM hq.studio_opportunities),
    'opportunities_active', (SELECT COUNT(*) FROM hq.studio_opportunities WHERE status NOT IN ('archived', 'rejected')),
    'calls_active', (SELECT COUNT(*) FROM hq.studio_calls WHERE status NOT IN ('lost', 'recycle', 'not_relevant')),
    'calls_with_deadline_30d', (
      SELECT COUNT(*) FROM hq.studio_calls
      WHERE deadline IS NOT NULL
        AND deadline >= CURRENT_DATE
        AND deadline <= CURRENT_DATE + INTERVAL '30 days'
        AND status NOT IN ('lost', 'recycle', 'not_relevant')
    ),
    'blueprints_in_progress', (SELECT COUNT(*) FROM hq.studio_blueprints WHERE status IN ('draft', 'in_review')),
    'blueprints_finalized', (SELECT COUNT(*) FROM hq.studio_blueprints WHERE status IN ('finalized', 'sent')),
    'deals_proposed', (SELECT COUNT(*) FROM hq.studio_deals WHERE status IN ('proposed', 'in_negotiation')),
    'deals_accepted', (SELECT COUNT(*) FROM hq.studio_deals WHERE status IN ('accepted', 'signed')),
    'advisory_active', (SELECT COUNT(*) FROM hq.studio_advisory WHERE status = 'active')
  ) INTO result;

  RETURN result;
END;
$$;

-- Seed bootstrap audit log entry
INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, details)
VALUES (
  'system', NULL, 'studio.module.installed', 'studio',
  jsonb_build_object(
    'module', 'EmotionSphere Studio',
    'version', '1.0.0',
    'tables', ARRAY[
      'studio_opportunities', 'studio_calls', 'studio_blueprints',
      'studio_deals', 'studio_advisory', 'studio_documents'
    ]
  )
);
