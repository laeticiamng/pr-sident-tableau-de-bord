-- ============================================================================
-- HORIZON 3 — Industrialisation & Gouvernance avancée
-- Axe 1 : SLO & Error Budget
-- Axe 2 : Governance Dashboard RPC
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Table hq.slo_targets
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hq.slo_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  target_pct NUMERIC NOT NULL CHECK (target_pct > 0 AND target_pct <= 100),
  window_days INT NOT NULL DEFAULT 7 CHECK (window_days > 0),
  unit TEXT NOT NULL DEFAULT 'percent', -- 'percent' | 'ms' | 'count'
  threshold_ms INT, -- pour SLO de latence (ex p95 <= 30000ms)
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hq.slo_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_read_slo_targets" ON hq.slo_targets;
CREATE POLICY "owner_read_slo_targets" ON hq.slo_targets
  FOR SELECT TO authenticated USING (public.is_owner());

DROP POLICY IF EXISTS "owner_manage_slo_targets" ON hq.slo_targets;
CREATE POLICY "owner_manage_slo_targets" ON hq.slo_targets
  FOR ALL TO authenticated
  USING (public.is_owner()) WITH CHECK (public.is_owner());

-- Seed des 4 SLO standards SaaS
INSERT INTO hq.slo_targets (key, name, description, target_pct, window_days, unit, threshold_ms) VALUES
  ('uptime_api', 'Disponibilité API', 'Pourcentage de healthchecks réussis', 99.5, 7, 'percent', NULL),
  ('p95_run_duration', 'Latence p95 des runs IA', 'p95 de durée d''exécution sous 30s', 95.0, 7, 'ms', 30000),
  ('run_success_rate', 'Taux de succès des runs', 'Runs complétés sans fallback / total runs', 95.0, 7, 'percent', NULL),
  ('data_freshness', 'Fraîcheur des données', 'Au moins 1 run dans les dernières 24h', 99.0, 7, 'percent', NULL)
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2) RPC get_hq_slo_status — calcule consommation budget restant
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_hq_slo_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  result JSONB;
  v_window_start TIMESTAMPTZ;
  v_p95_ms NUMERIC;
  v_p95_target_ms INT := 30000;
  v_p95_compliance NUMERIC;
  v_total_runs INT;
  v_success_runs INT;
  v_success_rate NUMERIC;
  v_recent_runs INT;
  v_freshness NUMERIC;
  v_uptime NUMERIC;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  v_window_start := now() - interval '7 days';

  -- p95 actuel
  SELECT
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000),
    COUNT(*)
  INTO v_p95_ms, v_total_runs
  FROM hq.runs
  WHERE status = 'completed'
    AND started_at IS NOT NULL AND completed_at IS NOT NULL
    AND created_at >= v_window_start;

  v_p95_compliance := CASE
    WHEN v_p95_ms IS NULL THEN 100
    WHEN v_p95_ms <= v_p95_target_ms THEN 100
    ELSE GREATEST(0, 100 - ((v_p95_ms - v_p95_target_ms)::numeric / v_p95_target_ms * 100))
  END;

  -- Success rate (completed sans fallback)
  SELECT COUNT(*) FILTER (WHERE status = 'completed' AND COALESCE((detailed_appendix->>'fallback_used')::boolean, false) = false)
  INTO v_success_runs
  FROM hq.runs WHERE created_at >= v_window_start;

  v_success_rate := CASE WHEN v_total_runs > 0
    THEN ROUND((v_success_runs::numeric / v_total_runs) * 100, 2)
    ELSE 100 END;

  -- Data freshness : runs dans les dernières 24h
  SELECT COUNT(*) INTO v_recent_runs
  FROM hq.runs WHERE created_at >= now() - interval '24 hours';
  v_freshness := CASE WHEN v_recent_runs > 0 THEN 100 ELSE 0 END;

  -- Uptime : approximé via absence d'erreurs critiques dans structured_logs (7j)
  WITH log_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE level = 'error') AS errors,
      COUNT(*) AS total
    FROM hq.structured_logs WHERE created_at >= v_window_start
  )
  SELECT CASE
    WHEN total = 0 THEN 100
    ELSE ROUND(GREATEST(0, 100 - (errors::numeric / total * 100))::numeric, 2)
  END INTO v_uptime FROM log_stats;

  result := jsonb_build_object(
    'window_days', 7,
    'computed_at', now(),
    'slos', jsonb_build_array(
      jsonb_build_object(
        'key', 'uptime_api', 'name', 'Disponibilité API',
        'target_pct', 99.5, 'current_pct', COALESCE(v_uptime, 100),
        'budget_remaining_pct', GREATEST(0, COALESCE(v_uptime, 100) - 99.5),
        'is_compliant', COALESCE(v_uptime, 100) >= 99.5
      ),
      jsonb_build_object(
        'key', 'p95_run_duration', 'name', 'Latence p95 des runs',
        'target_pct', 95.0, 'current_pct', ROUND(v_p95_compliance::numeric, 2),
        'current_value_ms', COALESCE(ROUND(v_p95_ms::numeric, 0), 0),
        'threshold_ms', v_p95_target_ms,
        'is_compliant', v_p95_compliance >= 95.0
      ),
      jsonb_build_object(
        'key', 'run_success_rate', 'name', 'Taux de succès des runs',
        'target_pct', 95.0, 'current_pct', v_success_rate,
        'budget_remaining_pct', GREATEST(0, v_success_rate - 95.0),
        'total_runs', v_total_runs, 'success_runs', v_success_runs,
        'is_compliant', v_success_rate >= 95.0
      ),
      jsonb_build_object(
        'key', 'data_freshness', 'name', 'Fraîcheur des données',
        'target_pct', 99.0, 'current_pct', v_freshness,
        'recent_runs_24h', v_recent_runs,
        'is_compliant', v_freshness >= 99.0
      )
    )
  );

  RETURN result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3) RPC get_hq_top_run_costs — top-5 runs les plus coûteux
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_hq_top_run_costs(p_window_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  result JSONB;
  cost_map jsonb := '{
    "DAILY_EXECUTIVE_BRIEF": 0.10, "CEO_STANDUP_MEETING": 0.05, "PLATFORM_STATUS_REVIEW": 0.02,
    "SECURITY_AUDIT_RLS": 0.18, "RELEASE_GATE_CHECK": 0.12, "DEPLOY_TO_PRODUCTION": 0.15,
    "RLS_POLICY_UPDATE": 0.20, "COMPETITIVE_ANALYSIS": 0.25, "QUALITY_AUDIT": 0.15,
    "ADS_PERFORMANCE_REVIEW": 0.10, "GROWTH_STRATEGY_REVIEW": 0.22, "OKR_QUARTERLY_REVIEW": 0.08,
    "COMPLIANCE_RGPD_CHECK": 0.16, "SEO_AUDIT": 0.20, "CONTENT_CALENDAR_PLAN": 0.06,
    "REVENUE_FORECAST": 0.14, "LEAD_SCORING_UPDATE": 0.07, "FINANCIAL_REPORT": 0.12,
    "RGPD_AUDIT": 0.16, "VULNERABILITY_SCAN": 0.18, "ROADMAP_UPDATE": 0.08,
    "CODE_REVIEW": 0.12, "DEPLOYMENT_CHECK": 0.06, "DATA_INSIGHTS_REPORT": 0.14,
    "AGENT_PERFORMANCE_REVIEW": 0.08, "TECH_WATCH_REPORT": 0.10, "MARKETING_WEEK_PLAN": 0.04,
    "MASS_EMAIL_CAMPAIGN": 0.15, "PRICING_CHANGE": 0.20
  }'::jsonb;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  WITH run_costs AS (
    SELECT
      run_type,
      COUNT(*)::int AS run_count,
      ROUND((COUNT(*) * COALESCE((cost_map->>run_type)::numeric, 0.05))::numeric, 2) AS total_cost_eur,
      COALESCE((cost_map->>run_type)::numeric, 0.05) AS unit_cost_eur
    FROM hq.runs
    WHERE created_at >= now() - (p_window_days || ' days')::interval
      AND status = 'completed'
    GROUP BY run_type
  )
  SELECT jsonb_build_object(
    'window_days', p_window_days,
    'computed_at', now(),
    'top_5', COALESCE(jsonb_agg(
      jsonb_build_object(
        'run_type', run_type,
        'run_count', run_count,
        'unit_cost_eur', unit_cost_eur,
        'total_cost_eur', total_cost_eur
      ) ORDER BY total_cost_eur DESC
    ) FILTER (WHERE rn <= 5), '[]'::jsonb),
    'total_cost_eur', COALESCE(SUM(total_cost_eur), 0),
    'total_runs', COALESCE(SUM(run_count), 0)
  ) INTO result
  FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY total_cost_eur DESC) AS rn FROM run_costs) ranked;

  RETURN result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4) RPC get_hq_governance_dashboard — agrège tout pour la page /hq/governance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_hq_governance_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  result JSONB;
  v_total_runs_30d INT;
  v_failed_runs_30d INT;
  v_dlq_pending INT;
  v_dlq_abandoned INT;
  v_audit_score NUMERIC;
  v_recent_audit_actions INT;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Stats runs 30j
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'failed')
  INTO v_total_runs_30d, v_failed_runs_30d
  FROM hq.runs WHERE created_at >= now() - interval '30 days';

  -- DLQ
  SELECT
    COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')),
    COUNT(*) FILTER (WHERE status = 'abandoned')
  INTO v_dlq_pending, v_dlq_abandoned
  FROM hq.runs_dlq;

  -- Actions d'audit récentes
  SELECT COUNT(*) INTO v_recent_audit_actions
  FROM hq.audit_logs WHERE created_at >= now() - interval '7 days';

  -- Score audit calculé : démarre à 100, retire pour chaque problème
  v_audit_score := 100;
  IF v_dlq_abandoned > 0 THEN v_audit_score := v_audit_score - LEAST(15, v_dlq_abandoned * 3); END IF;
  IF v_dlq_pending > 5 THEN v_audit_score := v_audit_score - 5; END IF;
  IF v_total_runs_30d > 0 AND (v_failed_runs_30d::numeric / v_total_runs_30d) > 0.05 THEN
    v_audit_score := v_audit_score - 10;
  END IF;

  result := jsonb_build_object(
    'computed_at', now(),
    'audit_score', GREATEST(0, v_audit_score),
    'audit_grade', CASE
      WHEN v_audit_score >= 95 THEN 'A+'
      WHEN v_audit_score >= 90 THEN 'A'
      WHEN v_audit_score >= 80 THEN 'B'
      WHEN v_audit_score >= 70 THEN 'C'
      ELSE 'D'
    END,
    'roadmap', jsonb_build_array(
      jsonb_build_object('horizon', 'H0', 'name', 'Sécurité fondamentale', 'status', 'completed', 'progress', 100,
        'highlights', jsonb_build_array('RLS purgé (6 politiques)', 'audit immutable', 'HIBP actif')),
      jsonb_build_object('horizon', 'H1', 'name', 'Refactor & résilience IA', 'status', 'completed', 'progress', 100,
        'highlights', jsonb_build_array('useHQData scindé en 4 hooks', 'Circuit-breaker AI Gateway', 'Alerte budget IA 80%')),
      jsonb_build_object('horizon', 'H2', 'name', 'Excellence ops', 'status', 'completed', 'progress', 100,
        'highlights', jsonb_build_array('DLQ + retry exponentiel', '/healthz public', 'p95 metrics', '12 specs Playwright')),
      jsonb_build_object('horizon', 'H3', 'name', 'Industrialisation & gouvernance', 'status', 'in_progress', 'progress', 75,
        'highlights', jsonb_build_array('SLO & error budget', 'Page /hq/governance', 'CI/CD GitHub Actions', 'Refactor executive-run final'))
    ),
    'reliability', jsonb_build_object(
      'total_runs_30d', v_total_runs_30d,
      'failed_runs_30d', v_failed_runs_30d,
      'success_rate_pct', CASE WHEN v_total_runs_30d > 0
        THEN ROUND(((v_total_runs_30d - v_failed_runs_30d)::numeric / v_total_runs_30d * 100), 2)
        ELSE 100 END,
      'dlq_pending', v_dlq_pending,
      'dlq_abandoned', v_dlq_abandoned
    ),
    'governance', jsonb_build_object(
      'recent_audit_actions_7d', v_recent_audit_actions,
      'rls_policies_count', (SELECT COUNT(*) FROM pg_policies WHERE schemaname IN ('hq', 'public')),
      'edge_functions_count', 17
    ),
    'runbooks', jsonb_build_array(
      jsonb_build_object('id', 'dlq_saturated', 'title', 'DLQ saturée (>20 entrées)',
        'steps', jsonb_build_array(
          'Consulter /hq/diagnostics → ReliabilityWidget',
          'Identifier le run_type récurrent',
          'Vérifier le statut breaker AI Gateway via /healthz',
          'Si breaker OPEN : attendre 60s ou relancer manuellement'
        )),
      jsonb_build_object('id', 'breaker_open', 'title', 'Circuit breaker AI Gateway OPEN',
        'steps', jsonb_build_array(
          'Vérifier le quota Lovable AI (settings)',
          'Consulter les logs structured_logs (source=ai-gateway)',
          'Le breaker se ferme automatiquement après 60s sans erreur'
        )),
      jsonb_build_object('id', 'budget_exceeded', 'title', 'Budget IA dépassé (>80% mensuel)',
        'steps', jsonb_build_array(
          'Consulter AICostWidget pour la projection',
          'Identifier le top-5 run_type coûteux ci-dessus',
          'Désactiver temporairement les runs autopilot non critiques',
          'Augmenter le seuil monthly_target_eur dans system_config si justifié'
        ))
    )
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_hq_slo_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hq_top_run_costs(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hq_governance_dashboard() TO authenticated;