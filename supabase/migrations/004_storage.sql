-- ==============================================================================
-- X FIT FORMULA — Migration 004: Storage Bucket & Policies
-- Run AFTER 003_assignments_progress.sql
-- ==============================================================================

-- ==============================================================================
-- EXERCISE MEDIA STORAGE BUCKET
-- Public read (exercise library is intentionally public)
-- Write restricted to service-role / admin operations (scripts)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'x-fit-formula-exercises',
  'x-fit-formula-exercises',
  true,                     -- public: exercise media is an intentionally public feature
  10485760,                 -- 10 MB per file (videos should be compressed to <2 MB)
  ARRAY['video/mp4','video/webm','image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read for all exercise media
DROP POLICY IF EXISTS "exercise_media_public_read" ON storage.objects;
CREATE POLICY "exercise_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'x-fit-formula-exercises');

-- Only authenticated users (trainers/admins via service-role scripts) can insert
DROP POLICY IF EXISTS "exercise_media_auth_insert" ON storage.objects;
CREATE POLICY "exercise_media_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'x-fit-formula-exercises'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users can update/delete exercise media
DROP POLICY IF EXISTS "exercise_media_auth_update" ON storage.objects;
CREATE POLICY "exercise_media_auth_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'x-fit-formula-exercises'
    AND auth.role() = 'authenticated'
  );

-- ==============================================================================
-- (FUTURE) USER UPLOADS BUCKET — Only create when client photo uploads are wired to Supabase
-- Currently client check-in photos are stored as base64 in localStorage.
-- Uncomment this section when migrating photo uploads to Supabase Storage.
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'x-fit-formula-uploads',
--   'x-fit-formula-uploads',
--   false,                    -- private: client photos are not public
--   5242880,                  -- 5 MB per file
--   ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic']
-- )
-- ON CONFLICT (id) DO NOTHING;
-- 
-- -- Users can read their own uploads only
-- DROP POLICY IF EXISTS "user_uploads_self_read" ON storage.objects;
-- CREATE POLICY "user_uploads_self_read"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'x-fit-formula-uploads'
--     AND (storage.foldername(name))[1] = auth.uid()::text
--   );
-- 
-- -- Users can upload to their own folder only
-- DROP POLICY IF EXISTS "user_uploads_self_insert" ON storage.objects;
-- CREATE POLICY "user_uploads_self_insert"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'x-fit-formula-uploads'
--     AND (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- -- Trainers can read their assigned clients' uploads
-- DROP POLICY IF EXISTS "user_uploads_trainer_read" ON storage.objects;
-- CREATE POLICY "user_uploads_trainer_read"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'x-fit-formula-uploads'
--     AND EXISTS (
--       SELECT 1 FROM public.trainer_clients tc
--       WHERE tc.trainer_id = auth.uid()
--         AND tc.client_id::text = (storage.foldername(name))[1]
--     )
--   );
