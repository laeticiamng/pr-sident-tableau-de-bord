
CREATE TABLE IF NOT EXISTS hq.studio_public_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_org TEXT,
  contact_role TEXT,
  domain TEXT,
  problem_statement TEXT NOT NULL,
  context TEXT,
  desired_outcome TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','converted','rejected','spam')),
  converted_opportunity_id UUID REFERENCES hq.studio_opportunities(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_pubsub_name_chk CHECK (char_length(contact_name) BETWEEN 1 AND 200),
  CONSTRAINT studio_pubsub_email_chk CHECK (char_length(contact_email) BETWEEN 3 AND 320),
  CONSTRAINT studio_pubsub_problem_chk CHECK (char_length(problem_statement) BETWEEN 10 AND 5000),
  CONSTRAINT studio_pubsub_context_chk CHECK (context IS NULL OR char_length(context) <= 5000),
  CONSTRAINT studio_pubsub_outcome_chk CHECK (desired_outcome IS NULL OR char_length(desired_outcome) <= 2000)
);
CREATE INDEX IF NOT EXISTS studio_pubsub_status_idx ON hq.studio_public_submissions (status, created_at DESC);
ALTER TABLE hq.studio_public_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads studio submissions" ON hq.studio_public_submissions FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "Owner manages studio submissions" ON hq.studio_public_submissions FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Deny client inserts on studio submissions" ON hq.studio_public_submissions FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE TABLE IF NOT EXISTS hq.studio_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','executed','cancelled')),
  requested_by UUID REFERENCES auth.users(id),
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  decision_reason TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT studio_approvals_title_chk CHECK (char_length(title) BETWEEN 1 AND 280)
);
CREATE INDEX IF NOT EXISTS studio_approvals_status_idx ON hq.studio_approvals (status, created_at DESC);
ALTER TABLE hq.studio_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads studio approvals" ON hq.studio_approvals FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "Owner manages studio approvals" ON hq.studio_approvals FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER trg_studio_approvals_updated_at BEFORE UPDATE ON hq.studio_approvals FOR EACH ROW EXECUTE FUNCTION hq.update_updated_at();

INSERT INTO hq.system_config (key, value)
VALUES ('studio_approval_gates',
  '{"create_deal":true,"submit_call_response":true,"send_legal_document":true,"sign_deal":true,"create_opportunity":false,"create_blueprint":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_studio_audit_trail(p_resource_type TEXT, p_resource_id UUID)
RETURNS TABLE(id UUID, occurred_at TIMESTAMPTZ, actor_type TEXT, actor_id TEXT, action TEXT, details JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','hq' AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  RETURN QUERY
  SELECT l.id, l.created_at, l.actor_type, l.actor_id, l.action, l.details
  FROM hq.audit_logs l
  WHERE (l.resource_type = p_resource_type AND l.resource_id = p_resource_id::TEXT)
     OR (p_resource_type='studio_opportunity' AND l.details->>'opportunity_id' = p_resource_id::TEXT)
     OR (p_resource_type='studio_blueprint'   AND l.details->>'blueprint_id'   = p_resource_id::TEXT)
     OR (p_resource_type='studio_deal'        AND l.details->>'deal_id'        = p_resource_id::TEXT)
  ORDER BY l.created_at DESC LIMIT 200;
END; $$;

CREATE OR REPLACE FUNCTION public.insert_studio_public_submission(
  p_contact_name TEXT, p_contact_email TEXT, p_problem_statement TEXT,
  p_contact_org TEXT DEFAULT NULL, p_contact_role TEXT DEFAULT NULL,
  p_domain TEXT DEFAULT NULL, p_context TEXT DEFAULT NULL,
  p_desired_outcome TEXT DEFAULT NULL, p_ip INET DEFAULT NULL, p_user_agent TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','hq' AS $$
DECLARE new_id UUID;
BEGIN
  INSERT INTO hq.studio_public_submissions (contact_name, contact_email, contact_org, contact_role, domain, problem_statement, context, desired_outcome, ip_address, user_agent)
  VALUES (p_contact_name, p_contact_email, p_contact_org, p_contact_role, p_domain, p_problem_statement, p_context, p_desired_outcome, p_ip, p_user_agent)
  RETURNING id INTO new_id;
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('public','anonymous','studio.public_submission.created','studio_public_submission', new_id::TEXT,
          jsonb_build_object('domain', p_domain, 'email', p_contact_email));
  RETURN new_id;
END; $$;

CREATE OR REPLACE FUNCTION public.list_studio_public_submissions(p_status TEXT DEFAULT NULL)
RETURNS SETOF hq.studio_public_submissions LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','hq' AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  RETURN QUERY SELECT * FROM hq.studio_public_submissions WHERE p_status IS NULL OR status = p_status ORDER BY created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.convert_studio_submission_to_opportunity(p_submission_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','hq' AS $$
DECLARE v_sub RECORD; v_opp_id UUID;
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  SELECT * INTO v_sub FROM hq.studio_public_submissions WHERE id = p_submission_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Soumission introuvable'; END IF;
  IF v_sub.converted_opportunity_id IS NOT NULL THEN RETURN v_sub.converted_opportunity_id; END IF;
  INSERT INTO hq.studio_opportunities (title, domain, source_type, description, problem_statement, created_by)
  VALUES (LEFT(v_sub.problem_statement, 200), v_sub.domain, 'public_submission',
    COALESCE(v_sub.context,'') || E'\n\nContact: ' || v_sub.contact_name || ' <' || v_sub.contact_email || '>'
      || COALESCE(E'\nOrganisation: ' || v_sub.contact_org,'')
      || COALESCE(E'\nRésultat souhaité: ' || v_sub.desired_outcome,''),
    v_sub.problem_statement, auth.uid())
  RETURNING id INTO v_opp_id;
  UPDATE hq.studio_public_submissions SET status='converted', reviewed_at=now(), converted_opportunity_id=v_opp_id WHERE id = p_submission_id;
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'studio.public_submission.converted','studio_opportunity', v_opp_id::TEXT,
          jsonb_build_object('submission_id', p_submission_id, 'opportunity_id', v_opp_id));
  RETURN v_opp_id;
END; $$;

CREATE OR REPLACE FUNCTION public.update_studio_submission_status(p_submission_id UUID, p_status TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','hq' AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  IF p_status NOT IN ('new','reviewed','converted','rejected','spam') THEN RAISE EXCEPTION 'Statut invalide'; END IF;
  UPDATE hq.studio_public_submissions SET status=p_status, reviewed_at=CASE WHEN p_status<>'new' THEN now() ELSE reviewed_at END WHERE id = p_submission_id;
  RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.request_studio_approval(
  p_action_type TEXT, p_title TEXT, p_payload JSONB DEFAULT '{}'::jsonb,
  p_resource_type TEXT DEFAULT NULL, p_resource_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL, p_risk_level TEXT DEFAULT 'medium')
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','hq' AS $$
DECLARE new_id UUID;
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  INSERT INTO hq.studio_approvals (action_type, resource_type, resource_id, title, description, payload, risk_level, requested_by)
  VALUES (p_action_type, p_resource_type, p_resource_id, p_title, p_description, p_payload, p_risk_level, auth.uid())
  RETURNING id INTO new_id;
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'studio.approval.requested','studio_approval', new_id::TEXT,
          jsonb_build_object('action_type', p_action_type, 'risk_level', p_risk_level,
                             'resource_type', p_resource_type, 'resource_id', p_resource_id));
  RETURN new_id;
END; $$;

CREATE OR REPLACE FUNCTION public.decide_studio_approval(p_approval_id UUID, p_decision TEXT, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','hq' AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  IF p_decision NOT IN ('approved','rejected','executed','cancelled') THEN RAISE EXCEPTION 'Décision invalide'; END IF;
  UPDATE hq.studio_approvals
  SET status=p_decision, decided_by=auth.uid(), decided_at=now(), decision_reason=p_reason,
      executed_at = CASE WHEN p_decision='executed' THEN now() ELSE executed_at END
  WHERE id = p_approval_id;
  INSERT INTO hq.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES ('owner', auth.uid()::TEXT, 'studio.approval.' || p_decision,'studio_approval', p_approval_id::TEXT,
          jsonb_build_object('reason', p_reason));
  RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.list_studio_approvals(p_status TEXT DEFAULT NULL)
RETURNS SETOF hq.studio_approvals LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','hq' AS $$
BEGIN
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Accès non autorisé'; END IF;
  RETURN QUERY SELECT * FROM hq.studio_approvals WHERE p_status IS NULL OR status = p_status
  ORDER BY CASE WHEN status='pending' THEN 0 ELSE 1 END, created_at DESC;
END; $$;
