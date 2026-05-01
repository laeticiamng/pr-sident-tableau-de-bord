-- Bucket privé pour pièces jointes des demandes d'approbation d'architecture
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'architecture-approvals',
  'architecture-approvals',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/png','image/jpeg','image/webp','image/gif',
    'text/plain','text/markdown','text/csv',
    'application/json',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Owner reads architecture approvals" ON storage.objects;
DROP POLICY IF EXISTS "Owner uploads architecture approvals" ON storage.objects;
DROP POLICY IF EXISTS "Owner updates architecture approvals" ON storage.objects;
DROP POLICY IF EXISTS "Owner deletes architecture approvals" ON storage.objects;

CREATE POLICY "Owner reads architecture approvals"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'architecture-approvals' AND public.is_owner());

CREATE POLICY "Owner uploads architecture approvals"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'architecture-approvals' AND public.is_owner());

CREATE POLICY "Owner updates architecture approvals"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'architecture-approvals' AND public.is_owner())
WITH CHECK (bucket_id = 'architecture-approvals' AND public.is_owner());

CREATE POLICY "Owner deletes architecture approvals"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'architecture-approvals' AND public.is_owner());