
-- Table de logs structurés persistants dans le schéma hq
CREATE TABLE hq.structured_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'critical')),
  source TEXT NOT NULL DEFAULT 'system' CHECK (source IN ('edge_function', 'agent', 'system', 'scheduler')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  run_id UUID REFERENCES hq.runs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour requêtes fréquentes
CREATE INDEX idx_structured_logs_level_created ON hq.structured_logs (level, created_at DESC);
CREATE INDEX idx_structured_logs_source ON hq.structured_logs (source);
CREATE INDEX idx_structured_logs_run_id ON hq.structured_logs (run_id) WHERE run_id IS NOT NULL;

-- Index pour optimiser les requêtes sur runs (Phase 5.2 anticipé)
CREATE INDEX idx_runs_type_created ON hq.runs (run_type, created_at DESC);
CREATE INDEX idx_runs_status_created ON hq.runs (status, created_at DESC);

-- RLS
ALTER TABLE hq.structured_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner accès complet" ON hq.structured_logs FOR ALL TO authenticated USING (public.is_owner());

-- RPC pour insérer un log (SECURITY DEFINER pour usage depuis les Edge Functions)
CREATE OR REPLACE FUNCTION public.insert_hq_log(
  p_level TEXT DEFAULT 'info',
  p_source TEXT DEFAULT 'system',
  p_message TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_run_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, hq
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO hq.structured_logs (level, source, message, metadata, run_id)
  VALUES (p_level, p_source, p_message, p_metadata, p_run_id)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- RPC pour lire les logs récents (owner only)
CREATE OR REPLACE FUNCTION public.get_hq_logs(
  limit_count INTEGER DEFAULT 50,
  level_filter TEXT DEFAULT NULL,
  source_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  level TEXT,
  source TEXT,
  message TEXT,
  metadata JSONB,
  run_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
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
  SELECT l.id, l.level, l.source, l.message, l.metadata, l.run_id, l.created_at
  FROM hq.structured_logs l
  WHERE (level_filter IS NULL OR l.level = level_filter)
    AND (source_filter IS NULL OR l.source = source_filter)
  ORDER BY l.created_at DESC
  LIMIT limit_count;
END;
$$;
