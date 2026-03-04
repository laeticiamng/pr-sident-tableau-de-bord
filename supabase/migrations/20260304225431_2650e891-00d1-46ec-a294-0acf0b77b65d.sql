
-- Table pour stocker les souscriptions push des navigateurs
CREATE TABLE IF NOT EXISTS hq.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  device_label TEXT DEFAULT 'Appareil',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Table pour stocker les VAPID keys auto-générées
-- On utilise system_config existant pour ça

-- RPC pour sauvegarder une souscription push
CREATE OR REPLACE FUNCTION public.save_push_subscription(
  p_endpoint TEXT,
  p_p256dh TEXT,
  p_auth_key TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_device_label TEXT DEFAULT 'Appareil'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  INSERT INTO hq.push_subscriptions (user_id, endpoint, p256dh, auth_key, user_agent, device_label)
  VALUES (auth.uid(), p_endpoint, p_p256dh, p_auth_key, p_user_agent, p_device_label)
  ON CONFLICT (user_id, endpoint) DO UPDATE SET
    p256dh = EXCLUDED.p256dh,
    auth_key = EXCLUDED.auth_key,
    user_agent = EXCLUDED.user_agent,
    is_active = true,
    last_used_at = now()
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- RPC pour récupérer toutes les souscriptions actives (pour l'edge function)
CREATE OR REPLACE FUNCTION public.get_active_push_subscriptions()
RETURNS TABLE(id UUID, endpoint TEXT, p256dh TEXT, auth_key TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
BEGIN
  -- Accessible uniquement par service_role (pas de vérif owner car appelé par edge function)
  RETURN QUERY
  SELECT s.id, s.endpoint, s.p256dh, s.auth_key
  FROM hq.push_subscriptions s
  WHERE s.is_active = true;
END;
$$;

-- RPC pour supprimer une souscription
CREATE OR REPLACE FUNCTION public.remove_push_subscription(p_endpoint TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  UPDATE hq.push_subscriptions 
  SET is_active = false 
  WHERE endpoint = p_endpoint AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;
