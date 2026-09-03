-- ==============================================================================
-- X FIT FORMULA — Migration 007: Profiles Biometrics & Trainer RLS Policy
-- Run in Supabase SQL Editor
-- ==============================================================================

-- 1. Add Biometrics & Onboarding Columns to profiles table if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_unit TEXT DEFAULT 'cm';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lifestyle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS injuries TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT 'general';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipment TEXT DEFAULT 'gym';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT 'beginner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS days_per_week INTEGER DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_meta JSONB;

-- 2. Ensure RLS Policy allows authenticated users (trainers & clients) to read profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read profile records (clients read trainers, trainers read clients)
DROP POLICY IF EXISTS "profiles_trainer_reads_clients" ON public.profiles;
DROP POLICY IF EXISTS "profiles_allow_authenticated_select" ON public.profiles;
CREATE POLICY "profiles_allow_authenticated_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow users to update their own profile (or trainers to update client plans)
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('trainer', 'admin')
    )
  );
