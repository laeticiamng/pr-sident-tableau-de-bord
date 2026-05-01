-- Client-side error journal (chunk loads, service worker failures, boot errors, react crashes)
CREATE TABLE IF NOT EXISTS public.client_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  page_path TEXT,
  build_version TEXT,
  has_service_worker BOOLEAN DEFAULT FALSE,
  in_iframe BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT client_error_logs_type_chk CHECK (
    error_type IN ('chunk_load', 'service_worker', 'react_render', 'unhandled_rejection', 'boot')
  ),
  CONSTRAINT client_error_logs_message_chk CHECK (char_length(message) <= 1000),
  CONSTRAINT client_error_logs_page_path_chk CHECK (page_path IS NULL OR char_length(page_path) <= 500),
  CONSTRAINT client_error_logs_user_agent_chk CHECK (user_agent IS NULL OR char_length(user_agent) <= 500)
);

CREATE INDEX IF NOT EXISTS client_error_logs_created_at_idx
  ON public.client_error_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS client_error_logs_type_idx
  ON public.client_error_logs (error_type, created_at DESC);

ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous + authenticated INSERT allowed (visitors can self-report errors).
-- Validated by the CHECK constraints above.
CREATE POLICY "Anyone can report a client error"
ON public.client_error_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only the President (owner) can read.
CREATE POLICY "Owner can read client error logs"
ON public.client_error_logs
FOR SELECT
TO authenticated
USING (public.is_owner());

-- No UPDATE / DELETE policy → immutable journal (matches `architectural-security-choices`).
