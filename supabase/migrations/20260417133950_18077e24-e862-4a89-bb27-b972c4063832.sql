-- =======================================================
-- HORIZON 2 : Dead Letter Queue + métrique p95 runs
-- =======================================================

-- 1) Table DLQ
CREATE TABLE IF NOT EXISTS hq.runs_dlq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_run_id UUID NOT NULL,
  run_type TEXT NOT NULL,
  platform_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  failure_reason TEXT,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'recovered', 'abandoned')),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_runs_dlq_pending
  ON hq.runs_dlq (next_retry_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_runs_dlq_status
  ON hq.runs_dlq (status, created_at DESC);

-- RLS
ALTER TABLE hq.runs_dlq ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner reads dlq" ON hq.runs_dlq;
CREATE POLICY "Owner reads dlq"
  ON hq.runs_dlq FOR SELECT
  TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "Owner manages dlq" ON hq.runs_dlq;
CREATE POLICY "Owner manages dlq"
  ON hq.runs_dlq FOR ALL
  TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- 2) RPCs DLQ
CREATE OR REPLACE FUNCTION public.enqueue_dlq_run(
  p_original_run_id UUID,
  p_run_type TEXT,
  p_platform_key TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_failure_reason TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Évite duplication : si un DLQ pending existe déjà pour ce run, on ne recrée pas
  SELECT id INTO new_id
  FROM hq.runs_dlq
  WHERE original_run_id = p_original_run_id
    AND status IN ('pending', 'in_progress')
  LIMIT 1;

  IF new_id IS NOT NULL THEN
    RETURN new_id;
  END IF;

  INSERT INTO hq.runs_dlq (
    original_run_id, run_type, platform_key, payload, failure_reason, next_retry_at
  ) VALUES (
    p_original_run_id, p_run_type, p_platform_key, p_payload, p_failure_reason,
    now() + interval '1 minute'  -- 1er retry après 1 min
  )
  RETURNING id INTO new_id;

  -- Audit
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('system', 'dlq', 'dlq.enqueued', 'run', p_original_run_id::TEXT,
    jsonb_build_object('run_type', p_run_type, 'reason', p_failure_reason));

  RETURN new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enqueue_dlq_run(UUID, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_dlq_run(UUID, TEXT, TEXT, JSONB, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.get_dlq_pending(limit_count INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  original_run_id UUID,
  run_type TEXT,
  platform_key TEXT,
  payload JSONB,
  attempts INT,
  max_attempts INT,
  next_retry_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  RETURN QUERY
  UPDATE hq.runs_dlq d
  SET status = 'in_progress', updated_at = now()
  WHERE d.id IN (
    SELECT d2.id FROM hq.runs_dlq d2
    WHERE d2.status = 'pending' AND d2.next_retry_at <= now()
    ORDER BY d2.next_retry_at ASC
    LIMIT limit_count
    FOR UPDATE SKIP LOCKED
  )
  RETURNING d.id, d.original_run_id, d.run_type, d.platform_key, d.payload,
            d.attempts, d.max_attempts, d.next_retry_at, d.failure_reason, d.created_at;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_dlq_pending(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_dlq_pending(INT) TO service_role;

CREATE OR REPLACE FUNCTION public.mark_dlq_attempt(
  p_dlq_id UUID,
  p_outcome TEXT,        -- 'recovered' | 'failed' | 'abandoned'
  p_error TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
DECLARE
  v_attempts INT;
  v_max_attempts INT;
  v_delay_minutes INT;
BEGIN
  IF p_outcome NOT IN ('recovered', 'failed', 'abandoned') THEN
    RAISE EXCEPTION 'Invalid outcome: %', p_outcome;
  END IF;

  SELECT attempts + 1, max_attempts INTO v_attempts, v_max_attempts
  FROM hq.runs_dlq WHERE id = p_dlq_id;

  IF p_outcome = 'recovered' THEN
    UPDATE hq.runs_dlq
    SET status = 'recovered',
        attempts = v_attempts,
        last_error = NULL,
        resolved_at = now(),
        updated_at = now()
    WHERE id = p_dlq_id;

  ELSIF p_outcome = 'abandoned' OR v_attempts >= v_max_attempts THEN
    UPDATE hq.runs_dlq
    SET status = 'abandoned',
        attempts = v_attempts,
        last_error = p_error,
        resolved_at = now(),
        updated_at = now()
    WHERE id = p_dlq_id;

  ELSE
    -- Retry exponentiel : 1min → 5min → 30min
    v_delay_minutes := CASE v_attempts
      WHEN 1 THEN 5
      WHEN 2 THEN 30
      ELSE 60
    END;
    UPDATE hq.runs_dlq
    SET status = 'pending',
        attempts = v_attempts,
        last_error = p_error,
        next_retry_at = now() + (v_delay_minutes || ' minutes')::interval,
        updated_at = now()
    WHERE id = p_dlq_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_dlq_attempt(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_dlq_attempt(UUID, TEXT, TEXT) TO service_role;

-- RPC owner pour UI : lister tous les DLQ
CREATE OR REPLACE FUNCTION public.get_hq_dlq_entries(limit_count INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  original_run_id UUID,
  run_type TEXT,
  platform_key TEXT,
  attempts INT,
  max_attempts INT,
  status TEXT,
  failure_reason TEXT,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, hq
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  RETURN QUERY
  SELECT d.id, d.original_run_id, d.run_type, d.platform_key,
         d.attempts, d.max_attempts, d.status, d.failure_reason,
         d.last_error, d.next_retry_at, d.created_at, d.resolved_at
  FROM hq.runs_dlq d
  ORDER BY d.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 3) Métrique p95 / p99 durée runs (7 derniers jours)
CREATE OR REPLACE FUNCTION public.get_hq_run_duration_metrics()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, hq
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  WITH durations AS (
    SELECT
      run_type,
      EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000 AS duration_ms
    FROM hq.runs
    WHERE status = 'completed'
      AND started_at IS NOT NULL
      AND completed_at IS NOT NULL
      AND created_at >= now() - interval '7 days'
  ),
  global_stats AS (
    SELECT
      COUNT(*)::int AS total_runs,
      ROUND(AVG(duration_ms)::numeric, 0) AS avg_ms,
      ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms)::numeric, 0) AS p50_ms,
      ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::numeric, 0) AS p95_ms,
      ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms)::numeric, 0) AS p99_ms,
      ROUND(MAX(duration_ms)::numeric, 0) AS max_ms
    FROM durations
  ),
  per_type AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'run_type', run_type,
        'count', count,
        'avg_ms', avg_ms,
        'p95_ms', p95_ms
      ) ORDER BY count DESC
    ) AS by_type
    FROM (
      SELECT
        run_type,
        COUNT(*)::int AS count,
        ROUND(AVG(duration_ms)::numeric, 0) AS avg_ms,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::numeric, 0) AS p95_ms
      FROM durations
      GROUP BY run_type
    ) t
  )
  SELECT jsonb_build_object(
    'window_days', 7,
    'total_runs', COALESCE(g.total_runs, 0),
    'avg_ms', COALESCE(g.avg_ms, 0),
    'p50_ms', COALESCE(g.p50_ms, 0),
    'p95_ms', COALESCE(g.p95_ms, 0),
    'p99_ms', COALESCE(g.p99_ms, 0),
    'max_ms', COALESCE(g.max_ms, 0),
    'by_run_type', COALESCE(p.by_type, '[]'::jsonb),
    'computed_at', now()
  ) INTO result
  FROM global_stats g, per_type p;

  RETURN result;
END;
$$;