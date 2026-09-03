-- ==============================================================================
-- X FIT FORMULA — Migration 006: Production Gym Workout Library
-- Table: gym_workout_videos
-- Structured level/day curriculum with optional tutorial media columns.
-- Prescription tuning (sets/reps/weight/rest) happens in the Trainer Builder;
-- this table stores the official course structure + demonstrator metadata only.
-- Mirrors migration 005 (home_workout_videos) so the Gym tab behaves identically.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gym_workout_videos (
  id                TEXT        PRIMARY KEY,
  exercise_name     TEXT        NOT NULL,
  slug              TEXT        NOT NULL,
  level             TEXT        NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
  day               TEXT,
  split_name        TEXT,
  section           TEXT,
  sets              TEXT,
  reps              TEXT,
  video_url         TEXT,
  video_id          TEXT,
  video_title       TEXT,
  video_description TEXT,
  thumbnail_url     TEXT,
  duration          TEXT,
  target_muscle     TEXT,
  equipment         TEXT,
  instructions      TEXT[]      DEFAULT '{}'::TEXT[],
  form_cues         TEXT[]      DEFAULT '{}'::TEXT[],
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gw_videos_level ON public.gym_workout_videos (level);
CREATE INDEX IF NOT EXISTS idx_gw_videos_day   ON public.gym_workout_videos (day);
CREATE INDEX IF NOT EXISTS idx_gw_videos_slug  ON public.gym_workout_videos (slug);
CREATE INDEX IF NOT EXISTS idx_gw_videos_name  ON public.gym_workout_videos (exercise_name);

-- RLS
ALTER TABLE public.gym_workout_videos ENABLE ROW LEVEL SECURITY;

-- Public read for the official curriculum library
DROP POLICY IF EXISTS "gw_videos_public_read" ON public.gym_workout_videos;
CREATE POLICY "gw_videos_public_read"
  ON public.gym_workout_videos FOR SELECT
  USING (true);

-- Authenticated admin/service-role write
DROP POLICY IF EXISTS "gw_videos_auth_write" ON public.gym_workout_videos;
CREATE POLICY "gw_videos_auth_write"
  ON public.gym_workout_videos FOR ALL
  USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Updated_at trigger
DROP TRIGGER IF EXISTS gw_videos_updated_at ON public.gym_workout_videos;
CREATE TRIGGER gw_videos_updated_at
  BEFORE UPDATE ON public.gym_workout_videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
