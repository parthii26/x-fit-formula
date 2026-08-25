# X FIT FORMULA — Production Platform

Precision fitness coaching and workout platform built with React, Vite, Tailwind CSS v4, and Supabase.

---

## 1. System Architecture

```text
               ┌───────────────────────────────┐
               │    GitHub (Source of Truth)   │
               └───────────────┬───────────────┘
                               │
               ┌───────────────▼───────────────┐
               │     Netlify CI/CD Pipeline    │
               │   (Frontend Application Only) │
               └───────────────┬───────────────┘
                               │
               ┌───────────────▼───────────────┐
               │         Client Browser        │
               │  (Mobile 90% • Desktop 10%)   │
               └───────┬───────────────┬───────┘
                       │               │
       Direct API / DB │               │ CDN Streaming
                       ▼               ▼
         ┌───────────────────┐   ┌─────────────────────────────┐
         │ Supabase Database │   │   Supabase Public Storage   │
         │  • PostgreSQL DB  │   │  • x-fit-formula-exercises  │
         │  • Supabase Auth  │   │    ├── home-workouts/       │
         │  • RLS Security   │   │    └── thumbnails/          │
         └───────────────────┘   └─────────────────────────────┘
                                               │
                                 ┌─────────────▼───────────────┐
                                 │   Supabase Private Storage  │
                                 │    (Client Progress Photos) │
                                 └─────────────────────────────┘
```

---

## 2. Multi-Computer Workflow

The repository is structured so development can seamlessly continue between multiple workstations (e.g. Office Computer & Personal Computer) without credential leaks or file conflicts.

### First-Time Setup on Any Computer

```bash
# 1. Clone the repository
git clone <GITHUB_REPOSITORY_URL>
cd x-fit-formula

# 2. Install dependencies
npm install

# 3. Create your local environment configuration
cp .env.example .env.local

# 4. Open .env.local and add your Supabase credentials
# (Never commit .env.local to Git)

# 5. Start the development server
npm run dev
```

### Daily Development Routine

#### Starting Work (e.g. at Office or Home)
```bash
git pull origin main
npm install
npm run dev
```

#### Saving & Pushing Changes
```bash
git status
git add .
git commit -m "feat(scope): describe your changes"
git push origin main
```

#### Switching to Other Computer
```bash
git pull origin main
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env.local`:

```env
# ── Frontend Safe (embedded into browser bundle via Vite) ──
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Local Backend Scripts (Node.js terminal only — NEVER commit) ──
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **CRITICAL SECURITY RULE**: `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security and must **never** be used in frontend code, committed to GitHub, or added to Netlify environment variables.

---

## 4. Database Migrations & Version Control

All database tables, constraints, security policies, and performance indexes are versioned in `supabase/migrations/`:

| Migration File | Description | Tables / Objects Created |
|---|---|---|
| [`001_exercises_workouts.sql`](supabase/migrations/001_exercises_workouts.sql) | Core exercise and workout schema | `exercises`, `workouts`, `workout_exercises` |
| [`002_profiles.sql`](supabase/migrations/002_profiles.sql) | User profile & Auth sync triggers | `profiles`, `handle_new_user()` trigger |
| [`003_assignments_progress.sql`](supabase/migrations/003_assignments_progress.sql) | Coaching & client progress | `trainer_clients`, `client_workouts`, `workout_progress`, `check_ins` |
| [`004_storage.sql`](supabase/migrations/004_storage.sql) | Storage buckets & storage RLS policies | `x-fit-formula-exercises`, `client-progress-photos` |
| [`005_home_workout_videos.sql`](supabase/migrations/005_home_workout_videos.sql) | Official Home Workout tutorial library | `home_workout_videos` |

### Applying Migrations to Supabase:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Run migrations `001` through `005` in sequential order.

---

## 5. Home Workout Video Library & Client Media

The platform separates **Tutorial Media Library** from **Workout Prescriptions**:

* **Video Library (`home_workout_videos`)**: Contains video metadata, canonical exercise name, level (`Beginner`, `Intermediate`, `Advanced`), storage URLs, and execution cues.
* **Workout Assignments (`workout_exercises` / `client_workouts`)**: Contains trainer prescriptions (sets, reps, rest, weight, notes) without modifying video records.

### Official Client Collection (13 Canonical Movements, 29 References):
* **Beginner (7)**: Warm-up, Incline Push-Ups, Free Squats, Standard Crunches, Bicycle Crunches, Plank, Walking.
* **Intermediate (11)**: Warm-up, Push-Ups, Free Squats, Crunches, Reverse Crunches, Leg Raises, Hanging Knee Raises, Bicycle Crunches, Mountain Climbers, Plank, Walking.
* **Advanced (11)**: Warm-up, Push-Ups, Free Squats, Crunches, Reverse Crunches, Leg Raises, Hanging Knee Raises, Bicycle Crunches, Mountain Climbers, Plank, Walking.

### Uploading Client Video Pack:
1. Place client video files (`*.mp4`, `*.webm`, `*.mov`) in `client-media/`.
2. Run the automated importer:
   ```bash
   node scripts/import-home-workout-videos.js
   ```
3. Videos are deduplicated and uploaded directly to Supabase Storage (`home-workouts/{slug}/`).

---

## 6. Netlify Production Deployment

1. Connect your GitHub repository to **Netlify**.
2. Set Build Settings:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
3. Add Environment Variables in Netlify Dashboard:
   * `VITE_SUPABASE_URL` = `https://your-project-ref.supabase.co`
   * `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
4. Netlify will automatically build and deploy lightweight assets (< 500 KB JS/CSS) on every `git push origin main`.

---

## 7. Available Scripts

* `npm run dev` — Start Vite local development server.
* `npm run build` — Build production bundle to `dist/`.
* `npm run preview` — Locally preview the production build.
* `node scripts/import-home-workout-videos.js` — Process & upload client video pack.
* `node scripts/verify-exercise-media.js` — Verify media path health.
