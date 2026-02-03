-- Corriger la fonction hq.update_updated_at avec search_path
CREATE OR REPLACE FUNCTION hq.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = hq
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;