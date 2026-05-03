
REVOKE EXECUTE ON FUNCTION public.get_studio_audit_trail(TEXT, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_studio_public_submissions(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.convert_studio_submission_to_opportunity(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_studio_submission_status(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_studio_approval(TEXT, TEXT, JSONB, TEXT, UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.decide_studio_approval(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_studio_approvals(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.insert_studio_public_submission(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,INET,TEXT) FROM anon, authenticated, public;
