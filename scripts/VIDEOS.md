# X FIT FORMULA — Exercise Video Sourcing Guide

This guide explains how to download and prepare the exercise videos for upload to Supabase Storage.

---

## Source Repository

**Repository:** https://github.com/arhxam/free-exercise-db-with-videos  
**Reference Site:** https://exercise-database.zenithfits.com/

> ⚠️ **Licensing Note:** The exercise metadata is MIT licensed. Before using any video file commercially,
> verify the individual media license. Store the `media_license` and `media_usage_verified` fields
> in the `exercises` table accordingly. The current seed data marks all 10 initial exercises as
> `"media_usage_verified": true` and `"media_license": "Verified Open-Access / Demo Attribution"`.

---

## Required Files for Phase 1 (10 Exercises)

### Male Videos (`public/media/videos/male/`)
| Filename | Exercise |
|---|---|
| `push-up.mp4` | Push-Up |
| `bodyweight-squat.mp4` | Bodyweight Squat |
| `glute-bridge.mp4` | Glute Bridge |
| `plank.mp4` | Plank |
| `reverse-lunge.mp4` | Reverse Lunge |
| `barbell-bench-press.mp4` | Barbell Bench Press |
| `lat-pulldown.mp4` | Lat Pulldown |
| `leg-press.mp4` | Leg Press |
| `seated-cable-row.mp4` | Seated Cable Row |
| `machine-shoulder-press.mp4` | Machine Shoulder Press |

### Female Videos (`public/media/videos/female/`)
Same filenames as male — place gender-specific demos in the female subfolder.
If no female demo is available for an exercise, the system automatically shows male video.

---

## Download Instructions

### Option A — Clone the Repository

```powershell
# Clone to a separate folder (not inside x-fit-formula)
git clone https://github.com/arhxam/free-exercise-db-with-videos C:\temp\exercise-db

# Then copy the specific exercise videos into the project
```

Find the matching exercises by slug/name in the cloned repository and copy `.mp4` files
into the project's `public/media/videos/male/` and `public/media/videos/female/` folders
with the exact stable filenames listed above.

### Option B — Download Individual Files

1. Browse to https://github.com/arhxam/free-exercise-db-with-videos
2. Navigate to the videos directory.
3. Find each exercise (search by name).
4. Download the `.mp4` file.
5. Rename to the stable slug format: `push-up.mp4`, `bodyweight-squat.mp4`, etc.
6. Place in the correct gender subfolder.

---

## Target Video Specifications

| Property | Target |
|---|---|
| Format | MP4 (H.264) |
| Duration | 3–8 second loop |
| Resolution | 720p or 1080p (scale down if needed) |
| File size | **~1.5–2 MB per video** (critical for mobile performance) |
| Audio | None (muted loop) |

### Compressing Videos (if needed)

If downloaded files are larger than 2 MB, compress using FFmpeg (free):

```bash
# Install FFmpeg: https://ffmpeg.org/download.html
# Compress a single video to ~1.5 MB target
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -vf "scale=720:-2" output.mp4

# Batch compress all male videos
for file in public/media/videos/male/*.mp4; do
  ffmpeg -i "$file" -vcodec libx264 -crf 28 -preset slow -vf "scale=720:-2" "${file%.mp4}_compressed.mp4"
done
```

---

## Upload to Supabase Storage

Once you have the video files in `public/media/videos/`:

```powershell
$env:SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
node scripts/upload-exercise-media.js
```

**Phase 1 test (5 videos):**
Upload only the 5 Home exercises first, verify playback in browser, then proceed with gym exercises.

**Verify uploads:**
```powershell
node scripts/verify-exercise-media.js
```

---

## Storage Structure in Supabase

```
x-fit-formula-exercises/          ← Bucket name (public)
  videos/
    male/
      push-up.mp4
      bodyweight-squat.mp4
      glute-bridge.mp4
      plank.mp4
      reverse-lunge.mp4
      barbell-bench-press.mp4
      lat-pulldown.mp4
      leg-press.mp4
      seated-cable-row.mp4
      machine-shoulder-press.mp4
    female/
      push-up.mp4
      ... (same naming)
  thumbnails/
    male/
      push-up.jpg
      ... (already have these locally as fallback)
    female/
      push-up.jpg
      ...
```

---

## Thumbnail Upload

The project already has all 10 thumbnails locally in `public/media/thumbnails/`.
These serve as the **immediate fallback** and are served from Netlify's CDN.

Optionally upload them to Supabase Storage for a single source of truth:
```powershell
node scripts/upload-exercise-media.js
```
The upload script handles both videos and thumbnails in one pass.

---

## Testing Video Playback

1. Upload 2 videos (e.g. `push-up.mp4` male + female).
2. Run `node scripts/verify-exercise-media.js` — confirm HTTP 200.
3. Open `http://localhost:5173` → Workout Library → click Push-Up card.
4. Video should autoplay, muted, looping.
5. Toggle Male/Female — both should play.
6. Test on mobile viewport (375px) — video should be responsive.
7. Check Supabase Storage dashboard for bandwidth usage.
8. Confirm file size is within target (~1.5–2 MB).

---

## Supabase Storage Budget Tracking

After uploading, check usage at:
**Supabase Dashboard → Storage → Usage**

| Phase | Videos | Estimated Storage |
|---|---|---|
| Phase 1 — Home Batch | 10 (5 male + 5 female) | ~15–20 MB |
| Phase 2 — Gym Batch | 10 more | ~30–40 MB total |
| Phase 3 — 50 exercises | 100 files | ~150–200 MB total |
| Phase 4 — 100 exercises | 200 files | ~300–400 MB total |
| Phase 5 — 400 exercises | 800 files | ~800 MB–1.2 GB total |

> ⚠️ At 400 exercises, storage will approach the Supabase Free limit (1 GB).
> Evaluate actual file sizes after Phase 1 before committing to the full library.
> If sizes exceed targets, compress before uploading.
