-- ============================================================
-- HORIZON 4 — SCALABILITÉ & MULTI-TENANCY (préparation hybride)
-- ============================================================

-- ===== AXE 3 : Schéma extensions =====
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Migration pgcrypto vers schéma extensions (sûr, pas de jobs dépendants)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto' AND extnamespace = 'public'::regnamespace) THEN
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgcrypto migration skipped: %', SQLERRM;
END $$;

-- Note: pg_cron et pg_net restent dans leurs schémas natifs (cron, net) car
-- Supabase ne supporte pas leur déplacement (jobs actifs + dépendances internes).
-- Ce choix est documenté dans docs/RUNBOOKS.md.

-- ============================================================
-- AXE 1 : MULTI-TENANCY HYBRIDE (préparation)
-- ============================================================

-- Table des organisations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Table de liaison user <-> organization
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Helper : vérifie l'appartenance à une organisation (security definer pour éviter récursion RLS)
CREATE OR REPLACE FUNCTION public.has_org_access(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- Helper : récupère la 1ère org du user (pour scoping par défaut)
CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC
  LIMIT 1
$$;

-- RLS organizations : owner global ou membre
CREATE POLICY "Members can view their organizations"
ON public.organizations FOR SELECT TO authenticated
USING (public.is_owner() OR public.has_org_access(auth.uid(), id));

CREATE POLICY "Owner manages organizations"
ON public.organizations FOR ALL TO authenticated
USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Deny anon access to organizations"
ON public.organizations FOR SELECT TO anon USING (false);

-- RLS organization_members
CREATE POLICY "Members view their memberships"
ON public.organization_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_owner());

CREATE POLICY "Owner manages memberships"
ON public.organization_members FOR ALL TO authenticated
USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Deny anon access to org_members"
ON public.organization_members FOR SELECT TO anon USING (false);

-- Ajout colonne organization_id sur tables HQ sensibles (nullable, prépare H5)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hq' AND table_name = 'runs') THEN
    ALTER TABLE hq.runs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS idx_hq_runs_org ON hq.runs(organization_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hq' AND table_name = 'audit_logs') THEN
    ALTER TABLE hq.audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hq' AND table_name = 'journal_entries') THEN
    ALTER TABLE hq.journal_entries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'hq' AND table_name = 'conversations') THEN
    ALTER TABLE hq.conversations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  END IF;
END $$;

-- Seed organisation par défaut
INSERT INTO public.organizations (slug, name, plan, settings)
VALUES ('emotionscare-hq', 'EmotionsCare HQ', 'enterprise',
        '{"is_default": true, "owner_org": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Rattachement automatique de tous les owners actuels à l'org par défaut
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT
  (SELECT id FROM public.organizations WHERE slug = 'emotionscare-hq'),
  ur.user_id,
  'owner'
FROM public.user_roles ur
WHERE ur.role = 'owner'
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- ============================================================
-- AXE 2 : RATE-LIMITING PERSISTANT PAR IP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON public.rate_limit_buckets(bucket_key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_expires ON public.rate_limit_buckets(expires_at);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads rate limit buckets"
ON public.rate_limit_buckets FOR SELECT TO authenticated USING (public.is_owner());

CREATE POLICY "Owner manages rate limit buckets"
ON public.rate_limit_buckets FOR ALL TO authenticated
USING (public.is_owner()) WITH CHECK (public.is_owner());

CREATE POLICY "Deny anon access to rate limit buckets"
ON public.rate_limit_buckets FOR SELECT TO anon USING (false);

-- RPC réutilisable depuis edge functions (appel via service_role)
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  p_bucket_key TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Purge entrées expirées (best-effort, non bloquant)
  DELETE FROM public.rate_limit_buckets WHERE expires_at < now();

  -- Fenêtre temporelle alignée
  v_window_start := date_trunc('second', now()) - 
                    make_interval(secs => EXTRACT(EPOCH FROM (now() - date_trunc('hour', now())))::int % p_window_seconds);
  v_expires_at := v_window_start + make_interval(secs => p_window_seconds);

  -- Upsert atomique
  INSERT INTO public.rate_limit_buckets (bucket_key, count, window_start, expires_at)
  VALUES (p_bucket_key, 1, v_window_start, v_expires_at)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET count = public.rate_limit_buckets.count + 1
  RETURNING count INTO v_current_count;

  RETURN jsonb_build_object(
    'allowed', v_current_count <= p_max_requests,
    'current', v_current_count,
    'max', p_max_requests,
    'remaining', GREATEST(0, p_max_requests - v_current_count),
    'reset_at', v_expires_at,
    'retry_after_seconds', CASE 
      WHEN v_current_count > p_max_requests 
      THEN EXTRACT(EPOCH FROM (v_expires_at - now()))::int 
      ELSE 0 
    END
  );
END;
$$;

-- RPC pour purge manuelle (owner only)
CREATE OR REPLACE FUNCTION public.purge_rate_limit_buckets()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_deleted INTEGER;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  DELETE FROM public.rate_limit_buckets WHERE expires_at < now();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================
-- AUDIT
-- ============================================================
INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, details)
VALUES (
  'system', 'horizon-4-migration', 'migration.applied', 'database',
  jsonb_build_object(
    'horizon', 'H4',
    'changes', jsonb_build_array(
      'organizations + organization_members tables',
      'has_org_access + current_user_org_id helpers',
      'organization_id columns added to hq.runs/audit_logs/journal_entries/conversations',
      'rate_limit_buckets + check_ip_rate_limit RPC',
      'pgcrypto migrated to extensions schema'
    )
  )
);