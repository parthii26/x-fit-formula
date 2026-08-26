-- ==============================================================================
-- X FIT FORMULA — Migration 001: Core Exercise & Workout Tables
-- Run in Supabase SQL Editor
-- Idempotent — safe to run on existing or fresh projects
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- EXERCISES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           TEXT        UNIQUE NOT NULL,
  name                TEXT        NOT NULL,
  slug                TEXT        UNIQUE NOT NULL,
  body_part           TEXT        NOT NULL,
  target              TEXT        NOT NULL,
  secondary_muscles   TEXT[]      DEFAULT '{}'::TEXT[],
  equipment           TEXT        NOT NULL,
  difficulty          TEXT        NOT NULL CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  category            TEXT        NOT NULL CHECK (category IN ('Home','Gym','Both')),
  compound            BOOLEAN     DEFAULT false,
  unilateral          BOOLEAN     DEFAULT false,
  short_description   TEXT,
  instructions        TEXT[]      DEFAULT '{}'::TEXT[],
  form_cues           TEXT[]      DEFAULT '{}'::TEXT[],
  common_mistakes     TEXT[]      DEFAULT '{}'::TEXT[],
  breathing           TEXT,
  -- Storage paths (relative to bucket root — never store full URLs)
  male_video_path         TEXT,
  female_video_path       TEXT,
  male_thumbnail_path     TEXT,
  female_thumbnail_path   TEXT,
  -- Licensing — kept separate from metadata license
  source_name         TEXT        DEFAULT 'Free Exercise DB with Videos',
  source_url          TEXT        DEFAULT 'https://github.com/arhxam/free-exercise-db-with-videos',
  metadata_license    TEXT        DEFAULT 'MIT',
  media_license       TEXT,                        -- e.g. 'CC-BY-4.0' | 'Proprietary' | NULL (unverified)
  attribution_required BOOLEAN   DEFAULT true,
  media_usage_verified BOOLEAN   DEFAULT false,    -- false by default — must be explicitly verified
  active              BOOLEAN     DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- WORKOUTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workouts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  slug             TEXT        UNIQUE NOT NULL,
  description      TEXT,
  goal             TEXT,
  difficulty       TEXT        CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  category         TEXT        CHECK (category IN ('Home','Gym','Both')),
  duration_minutes INTEGER     DEFAULT 45,
  equipment        TEXT,
  created_by       UUID,       -- references profiles(id), set after profiles migration
  active           BOOLEAN     DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist even if the workouts table was pre-existing
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 45;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ==============================================================================
-- WORKOUT EXERCISES (join / normalisation table)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id       UUID        NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id      UUID        REFERENCES public.exercises(id) ON DELETE SET NULL, -- nullable: exercise may not be in DB yet
  exercise_name    TEXT,       -- fallback when exercise_id is NULL
  exercise_order   INTEGER     NOT NULL DEFAULT 1,
  sets             TEXT        DEFAULT '3',
  reps             TEXT        DEFAULT '10-12',
  duration_seconds INTEGER,
  rest_seconds     INTEGER     DEFAULT 60,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT workout_exercise_unique UNIQUE (workout_id, exercise_order)
);

-- ==============================================================================
-- INDEXES — optimised for the exact filter fields used by the Exercise Library
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_exercises_name_fts
  ON public.exercises USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_exercises_slug        ON public.exercises (slug);
CREATE INDEX IF NOT EXISTS idx_exercises_source_id   ON public.exercises (source_id);
CREATE INDEX IF NOT EXISTS idx_exercises_body_part   ON public.exercises (body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_target      ON public.exercises (target);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment   ON public.exercises (equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty  ON public.exercises (difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_category    ON public.exercises (category);
CREATE INDEX IF NOT EXISTS idx_exercises_active      ON public.exercises (active);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout   ON public.workout_exercises (workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise  ON public.workout_exercises (exercise_id);

CREATE INDEX IF NOT EXISTS idx_workouts_slug         ON public.workouts (slug);
CREATE INDEX IF NOT EXISTS idx_workouts_active       ON public.workouts (active);

-- ==============================================================================
-- RLS — exercises & workouts are intentionally public-read for the MVP
-- (the exercise library is a public feature of X FIT FORMULA)
-- ==============================================================================
ALTER TABLE public.exercises       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Public read: any visitor can browse the exercise library
DROP POLICY IF EXISTS "exercises_public_read" ON public.exercises;
CREATE POLICY "exercises_public_read"
  ON public.exercises FOR SELECT USING (active = true);

-- Public read: any visitor can browse workouts
DROP POLICY IF EXISTS "workouts_public_read" ON public.workouts;
CREATE POLICY "workouts_public_read"
  ON public.workouts FOR SELECT USING (active = true);

-- Public read: workout exercise lists are readable
DROP POLICY IF EXISTS "workout_exercises_public_read" ON public.workout_exercises;
CREATE POLICY "workout_exercises_public_read"
  ON public.workout_exercises FOR SELECT USING (true);

-- Authenticated write: trainers/admins can insert/update workouts
DROP POLICY IF EXISTS "workouts_auth_insert" ON public.workouts;
CREATE POLICY "workouts_auth_insert"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "workouts_auth_update" ON public.workouts;
CREATE POLICY "workouts_auth_update"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "workout_exercises_auth_insert" ON public.workout_exercises;
CREATE POLICY "workout_exercises_auth_insert"
  ON public.workout_exercises FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "workout_exercises_auth_update" ON public.workout_exercises;
CREATE POLICY "workout_exercises_auth_update"
  ON public.workout_exercises FOR UPDATE
  USING (auth.uid() IS NOT NULL);
