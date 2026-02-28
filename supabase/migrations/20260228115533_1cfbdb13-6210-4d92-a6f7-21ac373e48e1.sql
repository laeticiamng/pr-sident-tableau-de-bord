-- Index pour filtrage rapide des logs par niveau et date
CREATE INDEX IF NOT EXISTS idx_structured_logs_level_created 
ON hq.structured_logs (level, created_at DESC);

-- Index pour filtrage par source
CREATE INDEX IF NOT EXISTS idx_structured_logs_source_created 
ON hq.structured_logs (source, created_at DESC);

-- Fonction de purge des logs de plus de 30 jours
CREATE OR REPLACE FUNCTION hq.purge_old_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'hq'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM hq.structured_logs
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Cron job pour purge quotidienne à 3h du matin
SELECT cron.schedule(
  'purge-old-hq-logs',
  '0 3 * * *',
  $$SELECT hq.purge_old_logs()$$
);