DROP POLICY IF EXISTS "Anyone can report a client error" ON public.client_error_logs;

CREATE POLICY "Anyone can report a validated client error"
ON public.client_error_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
  error_type IN ('chunk_load', 'service_worker', 'react_render', 'unhandled_rejection', 'boot')
  AND char_length(message) BETWEEN 1 AND 1000
  AND (page_path IS NULL OR (char_length(page_path) <= 500 AND left(page_path, 1) = '/'))
  AND (user_agent IS NULL OR char_length(user_agent) <= 500)
  AND (build_version IS NULL OR char_length(build_version) <= 64)
  AND (session_id IS NULL OR char_length(session_id) <= 64)
  AND created_at >= now() - interval '5 minutes'
  AND created_at <= now() + interval '1 minute'
);