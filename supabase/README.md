# X FIT FORMULA — Supabase Setup Guide

Complete step-by-step instructions to connect the X FIT FORMULA platform to Supabase Free.

---

## Step 1 — Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and open your project.
2. Navigate to **Settings → API**.
3. Copy:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **Project API Keys → `anon` / `public`** → this is your `VITE_SUPABASE_ANON_KEY`
   - **Project API Keys → `service_role`** → this is your `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **IMPORTANT**: The `service_role` key has full database access and bypasses RLS.
> It must **never** be used in frontend code or committed to git.
> It is used only in local terminal scripts (the `scripts/` folder).

---

## Step 2 — Create Your Local `.env.local` File

Open `.env.local` in the project root and fill in your real values:

```env
VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_URL=https://your-actual-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> The file already exists at `.env.local` — just replace the placeholder values.

---

## Step 3 — Run the Database Schema

1. Go to your Supabase project → **SQL Editor**.
2. Click **+ New query**.
3. Open the file `supabase/schema.sql` from this project.
4. Copy the **entire contents** and paste into the SQL Editor.
5. Click **Run** (or press Ctrl+Enter).

This creates:
- `exercises` table (with all 27 fields)
- `workouts` table
- `workout_exercises` join table
- All performance indexes
- Row Level Security (RLS) policies (public read for exercises/workouts)
- Storage bucket `x-fit-formula-exercises` (public read)

**Expected output:** No errors. Each `CREATE TABLE`, `CREATE INDEX`, and `CREATE POLICY` should succeed.

> If you see "already exists" messages, that is fine — the schema uses `IF NOT EXISTS`.

---

## Step 4 — Import the 10 Exercises

Run this from a terminal in the project root:

```powershell
$env:SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
node scripts/import-exercises.js
```

**Expected output:**
```
⚡ X FIT FORMULA — Exercise Database Importer
📦 Loaded 10 exercise records from seed dataset.
✅ Validation completed: 10 valid, 0 invalid.
  ✓ Synced: Push-Up (Source ID: 001-push-up)
  ✓ Synced: Bodyweight Squat (Source ID: 002-bodyweight-squat)
  ... (all 10)
📊 IMPORT EXECUTION SUMMARY
Synced Records: 10
Errors / Failed: 0
```

---

## Step 5 — Verify the Import

Check in the Supabase dashboard:
1. Go to **Table Editor → exercises**.
2. You should see 10 rows.
3. Confirm columns: `source_id`, `name`, `slug`, `body_part`, `target`, `equipment`, `difficulty`, `category`.

Or run the verify script (after setting env vars):

```powershell
$env:SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
node scripts/verify-exercise-media.js --dry-run
```

---

## Step 6 — Test Locally

1. Start the dev server:
   ```powershell
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173).
3. Navigate to the **Workout Library** from the landing page header button.
4. You should see:
   - 10 exercise cards loaded from Supabase (not seed data).
   - Each card shows thumbnail, name, target muscle, difficulty, equipment.
   - Clicking a card opens the Exercise Detail Modal.
5. Log in to the **Client Portal** → Workout Library tab → same 10 exercises.
6. Log in to the **Trainer Portal** → Workout Library tab → same 10 exercises.
7. Open browser console — confirm no errors and `source: 'supabase'` in network responses.

---

## Step 7 — Set Netlify Environment Variables

1. Go to [app.netlify.com](https://app.netlify.com) → your X FIT FORMULA site.
2. Navigate to **Site configuration → Environment variables**.
3. Click **Add a variable** and add:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

4. **Do NOT add** `SUPABASE_SERVICE_ROLE_KEY` to Netlify — it must never be in a deployed build.
5. Trigger a new deploy: **Deploys → Trigger deploy → Deploy site**.
6. Once deployed, verify at `https://x-fit-formula.netlify.app` → Workout Library → 10 cards load.

---

## Step 8 — Exercise Videos (Phased Upload)

Since you do not yet have the video files, follow the video sourcing guide: `scripts/VIDEOS.md`

The library works **fully without videos** right now:
- Exercises show their thumbnail images ✅
- Clicking opens the detail modal ✅
- Instructions, form cues, breathing guidance all display ✅
- If a video path exists but the file isn't uploaded → "Video Unavailable" message shows ✅

Add videos when you have them:
1. Source `.mp4` files (see `scripts/VIDEOS.md`)
2. Place in `public/media/videos/male/` and `public/media/videos/female/`
3. Run `node scripts/upload-exercise-media.js`

---

## Step 9 — Row Level Security Reference

The schema enforces the following access rules:

| Table | Public (anon) | Authenticated | Service Role |
|---|---|---|---|
| `exercises` | SELECT (active=true) | SELECT (active=true) | Full access |
| `workouts` | SELECT (active=true) | SELECT (active=true) | Full access |
| `workout_exercises` | SELECT | SELECT | Full access |
| `storage.objects` (exercises bucket) | SELECT | SELECT | Full access |

> Future tables (client profiles, check-ins, programs) will use auth-based RLS to enforce per-user data isolation.

---

## Step 10 — Workout Libraries (Home & Gym)

The Workout Library tabs (Client "Library" and Trainer "Workout Library") read from
two dedicated tables that mirror each other. Each table needs a migration + importer:

| Library | Table | Migration | Importer |
|---|---|---|---|
| Home Workouts | `home_workout_videos` | `supabase/migrations/005_home_workout_videos.sql` | `node scripts/import-home-workout-videos.js` |
| Gym Workouts | `gym_workout_videos` | `supabase/migrations/006_gym_workout_videos.sql` | `node scripts/import-gym-workout-videos.js` |

Setup for each library:

1. Run its migration file in the Supabase SQL editor (creates the table, RLS, indexes).
2. From the project root with `.env.local` credentials set, run its importer:
   ```bash
   node scripts/import-gym-workout-videos.js --dry-run   # preview counts first
   node scripts/import-gym-workout-videos.js             # seed the table
   ```
3. Redeploy Netlify if needed so the frontend reads the seeded rows.

> If a library's Supabase table is missing/empty/partial, the frontend automatically
> falls back to the bundled seed curriculum — it will never show fewer movements than
> the official program for a selected level/day.

---

## Supabase Free Tier Limits Reference

| Resource | Free Tier Limit | Current Usage |
|---|---|---|
| Database | 500 MB | < 1 MB (10 exercises) |
| Storage | 1 GB | 0 MB (videos not yet uploaded) |
| Bandwidth | 5 GB/month | Minimal |
| API requests | Unlimited (throttled) | Minimal |
| Active users | Unlimited | — |

At ~2 MB per exercise video pair (male + female), 10 exercises = ~20 MB.
The full 400-exercise library at this rate = ~800 MB → within 1 GB free storage.
Validate actual file sizes before mass upload.
