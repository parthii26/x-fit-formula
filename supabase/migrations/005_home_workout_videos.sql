-- ==============================================================================
-- X FIT FORMULA — Migration 005: Production Home Workout Video Library
-- Table: home_workout_videos
-- Describes tutorial media ONLY — does not store prescription/sets/reps.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.home_workout_videos (
  id                TEXT        PRIMARY KEY,
  exercise_name     TEXT        NOT NULL,
  slug              TEXT        NOT NULL,
  level             TEXT        NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
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

CREATE INDEX IF NOT EXISTS idx_hw_videos_level ON public.home_workout_videos (level);
CREATE INDEX IF NOT EXISTS idx_hw_videos_slug  ON public.home_workout_videos (slug);
CREATE INDEX IF NOT EXISTS idx_hw_videos_name  ON public.home_workout_videos (exercise_name);

-- RLS
ALTER TABLE public.home_workout_videos ENABLE ROW LEVEL SECURITY;

-- Public read for tutorials
DROP POLICY IF EXISTS "hw_videos_public_read" ON public.home_workout_videos;
CREATE POLICY "hw_videos_public_read"
  ON public.home_workout_videos FOR SELECT
  USING (true);

-- Authenticated admin/service-role write
DROP POLICY IF EXISTS "hw_videos_auth_write" ON public.home_workout_videos;
CREATE POLICY "hw_videos_auth_write"
  ON public.home_workout_videos FOR ALL
  USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Updated_at trigger
DROP TRIGGER IF EXISTS hw_videos_updated_at ON public.home_workout_videos;
CREATE TRIGGER hw_videos_updated_at
  BEFORE UPDATE ON public.home_workout_videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
