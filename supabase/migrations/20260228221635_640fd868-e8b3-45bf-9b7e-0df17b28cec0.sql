-- T4: Index pour requêtes performantes sur structured_logs
CREATE INDEX IF NOT EXISTS idx_structured_logs_level_created 
ON hq.structured_logs (level, created_at DESC);

-- T4: RPC de purge manuelle des logs > 30 jours
CREATE OR REPLACE FUNCTION public.purge_old_hq_logs(retention_days integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  DELETE FROM hq.structured_logs 
  WHERE created_at < now() - (retention_days || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the purge action
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, details)
  VALUES ('owner', auth.uid()::TEXT, 'logs.purged', 'structured_logs', 
          jsonb_build_object('retention_days', retention_days, 'deleted_count', deleted_count));
  
  RETURN deleted_count;
END;
$$;