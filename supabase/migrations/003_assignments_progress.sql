-- ==============================================================================
-- X FIT FORMULA — Migration 003: Assignments, Progress & Relationships
-- Run AFTER 002_profiles.sql
-- ==============================================================================

-- ==============================================================================
-- TRAINER ↔ CLIENT RELATIONSHIP
-- Explicit authorisation: a trainer must have a row here to access a client's data
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trainer_clients (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (trainer_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON public.trainer_clients (trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client  ON public.trainer_clients (client_id);

-- ==============================================================================
-- CLIENT WORKOUT ASSIGNMENTS
-- A trainer assigns a workout to a specific client for a specific date
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.client_workouts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id     UUID        NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  assigned_by    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_date  TIMESTAMPTZ DEFAULT now(),
  scheduled_date DATE,
  status         TEXT        NOT NULL DEFAULT 'assigned'
                             CHECK (status IN ('assigned','in_progress','completed','skipped')),
  completed_at   TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_workouts_client   ON public.client_workouts (client_id);
CREATE INDEX IF NOT EXISTS idx_client_workouts_workout  ON public.client_workouts (workout_id);
CREATE INDEX IF NOT EXISTS idx_client_workouts_status   ON public.client_workouts (status);
CREATE INDEX IF NOT EXISTS idx_client_workouts_date     ON public.client_workouts (scheduled_date);

DROP TRIGGER IF EXISTS client_workouts_updated_at ON public.client_workouts;
CREATE TRIGGER client_workouts_updated_at
  BEFORE UPDATE ON public.client_workouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- WORKOUT PROGRESS (per-exercise tracking within a session)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workout_progress (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id       UUID        NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id      UUID        REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name    TEXT,       -- fallback name when exercise_id is NULL
  completed        BOOLEAN     DEFAULT false,
  sets_completed   INTEGER,
  reps_completed   INTEGER,
  duration_seconds INTEGER,
  notes            TEXT,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_progress_client  ON public.workout_progress (client_id);
CREATE INDEX IF NOT EXISTS idx_workout_progress_workout ON public.workout_progress (workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_progress_date    ON public.workout_progress (completed_at);

-- ==============================================================================
-- CLIENT CHECK-INS
-- Daily nutrition / recovery / body composition entries
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.check_ins (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight         DECIMAL(5,2),
  body_fat       DECIMAL(4,2),
  energy_level   TEXT        CHECK (energy_level IN ('low','medium','high')),
  session_status TEXT,
  protein_g      INTEGER,
  calories       INTEGER,
  water_l        DECIMAL(3,1),
  sleep_h        DECIMAL(3,1),
  meals          TEXT,
  workout_notes  TEXT,
  trainer_note   TEXT,       -- trainer response
  reviewed       BOOLEAN     DEFAULT false,
  notes          TEXT,
  check_in_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_client ON public.check_ins (client_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date   ON public.check_ins (check_in_date);

-- ==============================================================================
-- RLS — Relationship, Assignment, Progress, Check-In tables
-- All use auth.uid() — no USING(true) on private tables
-- ==============================================================================

-- ── trainer_clients ──────────────────────────────────────────────────────────
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tc_trainer_reads_own" ON public.trainer_clients;
CREATE POLICY "tc_trainer_reads_own"
  ON public.trainer_clients FOR SELECT
  USING (trainer_id = auth.uid() OR client_id = auth.uid());

DROP POLICY IF EXISTS "tc_trainer_inserts" ON public.trainer_clients;
CREATE POLICY "tc_trainer_inserts"
  ON public.trainer_clients FOR INSERT
  WITH CHECK (trainer_id = auth.uid());

DROP POLICY IF EXISTS "tc_trainer_deletes" ON public.trainer_clients;
CREATE POLICY "tc_trainer_deletes"
  ON public.trainer_clients FOR DELETE
  USING (trainer_id = auth.uid());

-- ── client_workouts ──────────────────────────────────────────────────────────
ALTER TABLE public.client_workouts ENABLE ROW LEVEL SECURITY;

-- Client can read their own assignments
DROP POLICY IF EXISTS "cw_client_reads_own" ON public.client_workouts;
CREATE POLICY "cw_client_reads_own"
  ON public.client_workouts FOR SELECT
  USING (client_id = auth.uid());

-- Trainer can read assignments for their clients
DROP POLICY IF EXISTS "cw_trainer_reads_clients" ON public.client_workouts;
CREATE POLICY "cw_trainer_reads_clients"
  ON public.client_workouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
        AND tc.client_id  = client_workouts.client_id
    )
  );

-- Trainer can create assignments for their clients
DROP POLICY IF EXISTS "cw_trainer_inserts" ON public.client_workouts;
CREATE POLICY "cw_trainer_inserts"
  ON public.client_workouts FOR INSERT
  WITH CHECK (
    assigned_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
        AND tc.client_id  = client_workouts.client_id
    )
  );

-- Trainer can update assignments for their clients; client can update own status
DROP POLICY IF EXISTS "cw_update" ON public.client_workouts;
CREATE POLICY "cw_update"
  ON public.client_workouts FOR UPDATE
  USING (
    client_id = auth.uid()
    OR assigned_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
        AND tc.client_id  = client_workouts.client_id
    )
  );

-- ── workout_progress ─────────────────────────────────────────────────────────
ALTER TABLE public.workout_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wp_client_reads_own" ON public.workout_progress;
CREATE POLICY "wp_client_reads_own"
  ON public.workout_progress FOR SELECT
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "wp_trainer_reads_clients" ON public.workout_progress;
CREATE POLICY "wp_trainer_reads_clients"
  ON public.workout_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
        AND tc.client_id  = workout_progress.client_id
    )
  );

DROP POLICY IF EXISTS "wp_client_inserts" ON public.workout_progress;
CREATE POLICY "wp_client_inserts"
  ON public.workout_progress FOR INSERT
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "wp_client_updates" ON public.workout_progress;
CREATE POLICY "wp_client_updates"
  ON public.workout_progress FOR UPDATE
  USING (client_id = auth.uid());

-- ── check_ins ────────────────────────────────────────────────────────────────
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ci_client_reads_own" ON public.check_ins;
CREATE POLICY "ci_client_reads_own"
  ON public.check_ins FOR SELECT
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "ci_trainer_reads_clients" ON public.check_ins;
CREATE POLICY "ci_trainer_reads_clients"
  ON public.check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
        AND tc.client_id  = check_ins.client_id
    )
  );

DROP POLICY IF EXISTS "ci_client_inserts" ON public.check_ins;
CREATE POLICY "ci_client_inserts"
  ON public.check_ins FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Trainers can add their response note
DROP POLICY IF EXISTS "ci_trainer_review" ON public.check_ins;
CREATE POLICY "ci_trainer_review"
  ON public.check_ins FOR UPDATE
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trainer_clients tc
      WHERE tc.trainer_id = auth.uid()
        AND tc.client_id  = check_ins.client_id
    )
  );
