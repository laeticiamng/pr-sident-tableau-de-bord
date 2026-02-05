-- Create executive_runs_log table in HQ schema for run persistence
CREATE TABLE IF NOT EXISTS hq.executive_runs_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,
  run_type TEXT NOT NULL,
  platform_key TEXT,
  executive_summary TEXT,
  model_used TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE hq.executive_runs_log ENABLE ROW LEVEL SECURITY;

-- Create policy for owner-only access
CREATE POLICY "owner_only_executive_runs_log" ON hq.executive_runs_log
  FOR ALL
  USING (public.is_owner())
  WITH CHECK (public.is_owner());