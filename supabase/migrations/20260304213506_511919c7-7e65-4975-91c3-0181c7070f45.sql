
-- Table for presidential journal entries
CREATE TABLE hq.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL DEFAULT 'decision' CHECK (entry_type IN ('decision', 'note', 'milestone', 'reflection')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  linked_kpis JSONB DEFAULT '[]',
  impact_measured JSONB DEFAULT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE hq.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS: only owner can access
CREATE POLICY "Owner CRUD on journal_entries"
  ON hq.journal_entries FOR ALL
  TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- RPC: List journal entries
CREATE OR REPLACE FUNCTION public.get_hq_journal_entries(limit_count INT DEFAULT 50)
RETURNS TABLE(
  id UUID, entry_type TEXT, title TEXT, content TEXT, tags TEXT[],
  linked_kpis JSONB, impact_measured JSONB, is_pinned BOOLEAN,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  RETURN QUERY
  SELECT j.id, j.entry_type, j.title, j.content, j.tags,
         j.linked_kpis, j.impact_measured, j.is_pinned,
         j.created_at, j.updated_at
  FROM hq.journal_entries j
  WHERE j.user_id = auth.uid()
  ORDER BY j.is_pinned DESC, j.created_at DESC
  LIMIT limit_count;
END;
$$;

-- RPC: Create journal entry
CREATE OR REPLACE FUNCTION public.create_hq_journal_entry(
  p_title TEXT,
  p_content TEXT DEFAULT '',
  p_entry_type TEXT DEFAULT 'decision',
  p_tags TEXT[] DEFAULT '{}',
  p_linked_kpis JSONB DEFAULT '[]'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'hq'
AS $$
DECLARE new_id UUID;
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  INSERT INTO hq.journal_entries (user_id, title, content, entry_type, tags, linked_kpis)
  VALUES (auth.uid(), p_title, p_content, p_entry_type, p_tags, p_linked_kpis)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- RPC: Update journal entry
CREATE OR REPLACE FUNCTION public.update_hq_journal_entry(
  p_id UUID,
  p_title TEXT DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_impact_measured JSONB DEFAULT NULL,
  p_is_pinned BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  UPDATE hq.journal_entries SET
    title = COALESCE(p_title, title),
    content = COALESCE(p_content, content),
    tags = COALESCE(p_tags, tags),
    impact_measured = COALESCE(p_impact_measured, impact_measured),
    is_pinned = COALESCE(p_is_pinned, is_pinned),
    updated_at = now()
  WHERE id = p_id AND user_id = auth.uid();
  RETURN FOUND;
END;
$$;

-- RPC: Delete journal entry
CREATE OR REPLACE FUNCTION public.delete_hq_journal_entry(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  DELETE FROM hq.journal_entries WHERE id = p_id AND user_id = auth.uid();
  RETURN FOUND;
END;
$$;
