
-- Drop existing CHECK constraint on source column and recreate with push-triggers added
ALTER TABLE hq.structured_logs DROP CONSTRAINT IF EXISTS structured_logs_source_check;
ALTER TABLE hq.structured_logs ADD CONSTRAINT structured_logs_source_check CHECK (
  source IN ('edge_function', 'agent', 'system', 'scheduler', 'executive-run', 'autopilot', 'platform-monitor', 'push-triggers')
);
