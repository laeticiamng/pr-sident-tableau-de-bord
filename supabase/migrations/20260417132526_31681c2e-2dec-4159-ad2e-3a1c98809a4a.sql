-- 1) Seed configuration budget IA dans hq.system_config
INSERT INTO hq.system_config (key, value)
VALUES (
  'ai_budget',
  jsonb_build_object(
    'monthly_target_eur', 200,
    'alert_threshold_pct', 80,
    'daily_indicative_eur', 15,
    'alerts_enabled', true,
    'last_alert_sent_at', null
  )
)
ON CONFLICT (key) DO NOTHING;

-- 2) Étendre le CHECK constraint sur structured_logs pour autoriser la source 'budget-monitor'
DO $$
DECLARE
  constraint_def text;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO constraint_def
  FROM pg_constraint
  WHERE conrelid = 'hq.structured_logs'::regclass
    AND conname LIKE '%source%check%'
  LIMIT 1;

  IF constraint_def IS NOT NULL AND constraint_def NOT LIKE '%budget-monitor%' THEN
    EXECUTE (
      SELECT 'ALTER TABLE hq.structured_logs DROP CONSTRAINT ' || conname
      FROM pg_constraint
      WHERE conrelid = 'hq.structured_logs'::regclass
        AND conname LIKE '%source%check%'
      LIMIT 1
    );
    ALTER TABLE hq.structured_logs
    ADD CONSTRAINT structured_logs_source_check
    CHECK (source IN (
      'edge_function', 'agent', 'system', 'scheduler',
      'executive-run', 'autopilot', 'platform-monitor',
      'push-triggers', 'budget-monitor'
    ));
  END IF;
END $$;

-- 3) Fonction RPC : statut budget IA en temps réel (calcul à partir de hq.runs)
CREATE OR REPLACE FUNCTION public.get_hq_ai_budget_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  budget_cfg jsonb;
  monthly_target numeric;
  alert_threshold numeric;
  monthly_cost numeric := 0;
  daily_cost numeric := 0;
  start_of_month timestamptz;
  start_of_day timestamptz;
  day_of_month int;
  projection numeric;
  pct_used numeric;
  is_alert boolean;
  -- Coûts par run_type (miroir registry)
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

  -- Lecture config
  SELECT value INTO budget_cfg FROM hq.system_config WHERE key = 'ai_budget';
  monthly_target := COALESCE((budget_cfg->>'monthly_target_eur')::numeric, 200);
  alert_threshold := COALESCE((budget_cfg->>'alert_threshold_pct')::numeric, 80);

  start_of_month := date_trunc('month', now());
  start_of_day := date_trunc('day', now());
  day_of_month := EXTRACT(DAY FROM now())::int;

  -- Calcul coûts à partir des runs réussis
  SELECT
    COALESCE(SUM(COALESCE((cost_map->>r.run_type)::numeric, 0.05)), 0)
  INTO monthly_cost
  FROM hq.runs r
  WHERE r.created_at >= start_of_month
    AND r.status = 'completed';

  SELECT
    COALESCE(SUM(COALESCE((cost_map->>r.run_type)::numeric, 0.05)), 0)
  INTO daily_cost
  FROM hq.runs r
  WHERE r.created_at >= start_of_day
    AND r.status = 'completed';

  pct_used := CASE WHEN monthly_target > 0 THEN (monthly_cost / monthly_target) * 100 ELSE 0 END;
  projection := CASE WHEN day_of_month > 0 THEN (monthly_cost / day_of_month) * 30 ELSE 0 END;
  is_alert := pct_used >= alert_threshold;

  RETURN jsonb_build_object(
    'monthly_cost_eur', round(monthly_cost::numeric, 2),
    'daily_cost_eur', round(daily_cost::numeric, 2),
    'monthly_target_eur', monthly_target,
    'alert_threshold_pct', alert_threshold,
    'pct_used', round(pct_used::numeric, 1),
    'projection_eur', round(projection::numeric, 2),
    'is_alert_threshold_reached', is_alert,
    'last_alert_sent_at', budget_cfg->'last_alert_sent_at',
    'computed_at', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_hq_ai_budget_status() TO authenticated;