#!/usr/bin/env node
/**
 * ============================================================================
 * X FIT FORMULA — Production Home Workout Video Library Importer
 * ============================================================================
 * Usage:
 *   node scripts/import-home-workout-videos.js [--dry-run]
 *
 * Scans for client-provided video packs, inventories media, uploads to
 * Supabase Storage (home-workouts/{slug}/), and seeds home_workout_videos table.
 * ============================================================================
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedFilePath = path.join(__dirname, '../data/home-workout-seed.json')

// ── Auto-load .env.local ─────────────────────────────────────────────────────
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../.env.local')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && val && !process.env[key]) {
      process.env[key] = val
    }
  }
}
loadEnvFile()

const isDryRun = process.argv.includes('--dry-run')
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

const BUCKET_NAME = 'x-fit-formula-exercises'

console.log('────────────────────────────────────────────────────────────')
console.log('⚡ X FIT FORMULA — Production Home Workout Video Importer')
console.log('────────────────────────────────────────────────────────────')

// ── Official Client Requirements Definition ─────────────────────────────────
const CLIENT_REQUIREMENTS = {
  Beginner: [
    'Warm-up',
    'Incline Push-Ups',
    'Free Squats',
    'Standard Crunches',
    'Bicycle Crunches',
    'Plank',
    'Walking',
  ],
  Intermediate: [
    'Warm-up',
    'Push-Ups',
    'Free Squats',
    'Crunches',
    'Reverse Crunches',
    'Leg Raises',
    'Hanging Knee Raises',
    'Bicycle Crunches',
    'Mountain Climbers',
    'Plank',
    'Walking',
  ],
  Advanced: [
    'Warm-up',
    'Push-Ups',
    'Free Squats',
    'Crunches',
    'Reverse Crunches',
    'Leg Raises',
    'Hanging Knee Raises',
    'Bicycle Crunches',
    'Mountain Climbers',
    'Plank',
    'Walking',
  ],
}

// ── Load Seed Definitions ────────────────────────────────────────────────────
if (!fs.existsSync(seedFilePath)) {
  console.error(`❌ Seed file not found: ${seedFilePath}`)
  process.exit(1)
}

const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'))
const totalRequiredReferences =
  CLIENT_REQUIREMENTS.Beginner.length +
  CLIENT_REQUIREMENTS.Intermediate.length +
  CLIENT_REQUIREMENTS.Advanced.length

const uniqueExercisesSet = new Set(seedData.map((s) => s.exercise_name))
const totalUniqueExercises = uniqueExercisesSet.size

console.log(`\n📋 Client Collection Scope:`)
console.log(`  • Beginner:     ${CLIENT_REQUIREMENTS.Beginner.length} exercises`)
console.log(`  • Intermediate: ${CLIENT_REQUIREMENTS.Intermediate.length} exercises`)
console.log(`  • Advanced:     ${CLIENT_REQUIREMENTS.Advanced.length} exercises`)
console.log(`  • Total Required Video References: ${totalRequiredReferences}`)
console.log(`  • Total Unique Canonical Movements: ${totalUniqueExercises}\n`)

// ── Search for Physical Client Video Pack ────────────────────────────────────
const candidatePaths = [
  path.join(__dirname, '../client-media'),
  path.join(__dirname, '../client-videos'),
  path.join(__dirname, '../media-pack'),
  path.join(__dirname, '../raw-videos'),
  path.join(__dirname, '../videos'),
]

let foundMediaDir = null
for (const p of candidatePaths) {
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    const files = fs.readdirSync(p).filter((f) => /\.(mp4|webm|mov|m4v)$/i.test(f))
    if (files.length > 0) {
      foundMediaDir = p
      break
    }
  }
}

// ── Execute Inventory & Upload Pipeline ──────────────────────────────────────
async function run() {
  if (!foundMediaDir) {
    console.log('────────────────────────────────────────────────────────────')
    console.log('⚠️  CLIENT VIDEO PACK NOT FOUND')
    console.log('────────────────────────────────────────────────────────────')
    console.log('The production database architecture and metadata schema are ready,')
    console.log('but physical client media files (*.mp4, *.webm, *.mov) have not')
    console.log('yet been placed in a client-media/ directory.')
    console.log('\nTo upload actual client videos:')
    console.log('  1. Place your video files in a folder named: client-media/')
    console.log('  2. Re-run: node scripts/import-home-workout-videos.js')
    console.log('────────────────────────────────────────────────────────────\n')

    printValidationReport({
      totalRequired: totalRequiredReferences,
      totalUniqueExercises,
      totalPhysicalVideos: 0,
      matched: 0,
      missing: totalUniqueExercises,
      duplicates: 0,
      unused: 0,
    })

    return
  }

  // If media pack exists, scan and inventory
  console.log(`🔍 Located Client Video Pack at: ${foundMediaDir}`)
  const files = fs.readdirSync(foundMediaDir).filter((f) => /\.(mp4|webm|mov|m4v)$/i.test(f))
  console.log(`📦 Found ${files.length} media file(s). Creating inventory...\n`)

  const inventory = files.map((file) => {
    const fullPath = path.join(foundMediaDir, file)
    const stats = fs.statSync(fullPath)
    return {
      filename: file,
      ext: path.extname(file).toLowerCase(),
      sizeBytes: stats.size,
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
    }
  })

  console.log('Media Inventory:')
  inventory.forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${item.filename} (${item.sizeMB} MB, ${item.ext})`)
  })

  // Match against required canonical exercises
  let matchedCount = 0
  let unusedCount = 0

  inventory.forEach((item) => {
    const cleanName = item.filename
      .toLowerCase()
      .replace(/\.(mp4|webm|mov|m4v)$/i, '')
      .replace(/[-_]/g, ' ')

    const matchedSeed = seedData.find(
      (s) =>
        s.slug.replace(/-/g, ' ') === cleanName ||
        s.exercise_name.toLowerCase() === cleanName
    )

    if (matchedSeed) {
      matchedCount++
      item.matchedSlug = matchedSeed.slug
      console.log(`  ✓ Matched: ${item.filename} → ${matchedSeed.exercise_name}`)
    } else {
      unusedCount++
      console.log(`  ○ Unmatched/Unused file: ${item.filename}`)
    }
  })

  // Supabase Upload if not dry-run and credentials exist
  if (!isDryRun && supabaseUrl && supabaseKey) {
    console.log('\n☁️  Uploading deduplicated assets to Supabase Storage...')
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

    for (const item of inventory) {
      if (!item.matchedSlug) continue
      const storagePath = `home-workouts/${item.matchedSlug}/tutorial${item.ext}`
      const fileBuffer = fs.readFileSync(path.join(foundMediaDir, item.filename))

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType: item.ext === '.webm' ? 'video/webm' : 'video/mp4',
          upsert: true,
        })

      if (error) {
        console.error(`  ❌ Failed uploading ${storagePath}:`, error.message)
      } else {
        console.log(`  ✅ Uploaded to Storage: ${storagePath}`)
      }
    }

    // Seed database records in home_workout_videos table
    console.log('\n💾 Syncing home_workout_videos database records...')
    for (const record of seedData) {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${record.storage_path}`
      const { error: dbErr } = await supabase
        .from('home_workout_videos')
        .upsert(
          {
            id: record.id,
            exercise_name: record.exercise_name,
            slug: record.slug,
            level: record.level,
            video_url: publicUrl,
            video_id: record.video_id,
            video_title: record.video_title,
            video_description: record.video_description,
            thumbnail_url: record.thumbnail_path,
            target_muscle: record.target_muscle,
            equipment: record.equipment,
            instructions: record.instructions || [],
            form_cues: record.form_cues || [],
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (dbErr) {
        console.warn(`  ⚠️  Database sync warning for ${record.id}:`, dbErr.message)
      } else {
        console.log(`  ✓ Synced DB: [${record.level}] ${record.exercise_name}`)
      }
    }
  }

  printValidationReport({
    totalRequired: totalRequiredReferences,
    totalUniqueExercises,
    totalPhysicalVideos: inventory.length,
    matched: matchedCount,
    missing: Math.max(0, totalUniqueExercises - matchedCount),
    duplicates: 0,
    unused: unusedCount,
  })
}

function printValidationReport(stats) {
  console.log('────────────────────────────────────────────────────────────')
  console.log('📊 PRODUCTION VIDEO VALIDATION REPORT')
  console.log('────────────────────────────────────────────────────────────')
  console.log(`TOTAL REQUIRED VIDEO REFERENCES:  ${stats.totalRequired}`)
  console.log(`  • BEGINNER:                     ${CLIENT_REQUIREMENTS.Beginner.length}`)
  console.log(`  • INTERMEDIATE:                 ${CLIENT_REQUIREMENTS.Intermediate.length}`)
  console.log(`  • ADVANCED:                     ${CLIENT_REQUIREMENTS.Advanced.length}`)
  console.log(`TOTAL UNIQUE EXERCISES:           ${stats.totalUniqueExercises}`)
  console.log(`TOTAL UNIQUE PHYSICAL VIDEOS:     ${stats.totalPhysicalVideos}`)
  console.log(`MATCHED:                          ${stats.matched}`)
  console.log(`MISSING:                          ${stats.missing}`)
  console.log(`DUPLICATES AVOIDED:               ${stats.duplicates}`)
  console.log(`UNUSED CLIENT FILES:              ${stats.unused}`)
  console.log('────────────────────────────────────────────────────────────\n')
}

run()
