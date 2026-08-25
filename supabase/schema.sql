-- ==============================================================================
-- X FIT FORMULA — Database Schema Migration
-- Module: Exercise Database, Video Library, Workouts & Storage Architecture
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Exercises Table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body_part TEXT NOT NULL,
  target TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}'::TEXT[],
  equipment TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  category TEXT NOT NULL CHECK (category IN ('Home', 'Gym', 'Both')),
  compound BOOLEAN DEFAULT false,
  unilateral BOOLEAN DEFAULT false,
  short_description TEXT,
  instructions TEXT[] DEFAULT '{}'::TEXT[],
  form_cues TEXT[] DEFAULT '{}'::TEXT[],
  common_mistakes TEXT[] DEFAULT '{}'::TEXT[],
  breathing TEXT,
  male_video_path TEXT,
  female_video_path TEXT,
  male_thumbnail_path TEXT,
  female_thumbnail_path TEXT,
  source_name TEXT DEFAULT 'Free Exercise DB with Videos',
  source_url TEXT DEFAULT 'https://github.com/arhxam/free-exercise-db-with-videos',
  metadata_license TEXT DEFAULT 'MIT',
  media_license TEXT DEFAULT 'Verified Open-Access / Demo Attribution',
  attribution_required BOOLEAN DEFAULT true,
  media_usage_verified BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Workouts Table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  goal TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  category TEXT CHECK (category IN ('Home', 'Gym', 'Both')),
  duration_minutes INTEGER DEFAULT 45,
  equipment TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Workout Exercises Join Table (Normalized Exercise Reuse)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  exercise_order INTEGER NOT NULL DEFAULT 1,
  sets TEXT DEFAULT '3',
  reps TEXT DEFAULT '10–12',
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_exercises_name ON public.exercises USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_exercises_slug ON public.exercises (slug);
CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON public.exercises (body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_target ON public.exercises (target);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON public.exercises (equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises (difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises (category);
CREATE INDEX IF NOT EXISTS idx_exercises_active ON public.exercises (active);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises (workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON public.workout_exercises (exercise_id);

-- 6. Row Level Security (RLS)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active exercises & workouts
DROP POLICY IF EXISTS "Public read access on active exercises" ON public.exercises;
CREATE POLICY "Public read access on active exercises"
  ON public.exercises FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Public read access on active workouts" ON public.workouts;
CREATE POLICY "Public read access on active workouts"
  ON public.workouts FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Public read access on workout exercises" ON public.workout_exercises;
CREATE POLICY "Public read access on workout exercises"
  ON public.workout_exercises FOR SELECT
  USING (true);

-- 7. Supabase Storage Bucket Initialization & Policies
-- Bucket name: x-fit-formula-exercises
INSERT INTO storage.buckets (id, name, public)
VALUES ('x-fit-formula-exercises', 'x-fit-formula-exercises', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access policy for x-fit-formula-exercises storage objects
DROP POLICY IF EXISTS "Public read access on exercise media" ON storage.objects;
CREATE POLICY "Public read access on exercise media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'x-fit-formula-exercises');
