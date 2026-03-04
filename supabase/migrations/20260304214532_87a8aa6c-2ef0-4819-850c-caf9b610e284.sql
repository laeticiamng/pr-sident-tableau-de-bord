
-- Table dédiée pour les Morning Digests structurés
CREATE TABLE hq.morning_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  executive_summary TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '{}',
  data_sources TEXT[] NOT NULL DEFAULT '{}',
  model_used TEXT,
  generation_duration_ms INTEGER,
  triggered_by TEXT NOT NULL DEFAULT 'scheduler',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(digest_date)
);

-- RPC pour récupérer le digest du jour (ou le plus récent)
CREATE OR REPLACE FUNCTION public.get_hq_morning_digest(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  id UUID,
  digest_date DATE,
  executive_summary TEXT,
  sections JSONB,
  data_sources TEXT[],
  model_used TEXT,
  generation_duration_ms INTEGER,
  triggered_by TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  RETURN QUERY
  SELECT d.id, d.digest_date, d.executive_summary, d.sections,
         d.data_sources, d.model_used, d.generation_duration_ms,
         d.triggered_by, d.created_at
  FROM hq.morning_digests d
  WHERE d.digest_date <= p_date
  ORDER BY d.digest_date DESC
  LIMIT 1;
END;
$$;

-- RPC pour insérer/mettre à jour le digest (upsert par date)
CREATE OR REPLACE FUNCTION public.upsert_hq_morning_digest(
  p_executive_summary TEXT,
  p_sections JSONB DEFAULT '{}',
  p_data_sources TEXT[] DEFAULT '{}',
  p_model_used TEXT DEFAULT NULL,
  p_generation_duration_ms INTEGER DEFAULT NULL,
  p_triggered_by TEXT DEFAULT 'scheduler'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO hq.morning_digests (
    digest_date, executive_summary, sections, data_sources,
    model_used, generation_duration_ms, triggered_by
  ) VALUES (
    CURRENT_DATE, p_executive_summary, p_sections, p_data_sources,
    p_model_used, p_generation_duration_ms, p_triggered_by
  )
  ON CONFLICT (digest_date) DO UPDATE SET
    executive_summary = EXCLUDED.executive_summary,
    sections = EXCLUDED.sections,
    data_sources = EXCLUDED.data_sources,
    model_used = EXCLUDED.model_used,
    generation_duration_ms = EXCLUDED.generation_duration_ms,
    triggered_by = EXCLUDED.triggered_by,
    created_at = now()
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
