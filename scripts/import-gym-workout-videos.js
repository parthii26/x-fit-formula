#!/usr/bin/env node
/**
 * ============================================================================
 * X FIT FORMULA — Production Gym Workout Library Importer
 * ============================================================================
 * Usage:
 *   node scripts/import-gym-workout-videos.js [--dry-run]
 *
 * Seeds the `gym_workout_videos` table from data/gym-workout-seed.json so the
 * Gym Workout Library tab is backed by Supabase exactly like the Home Workout
 * Library (see scripts/import-home-workout-videos.js).
 *
 * The Gym seed carries the official structured curriculum (level/day/split/
 * sets/reps/target/equipment) — no physical video media yet. When client
 * tutorial videos are supplied later, add media columns/uploads here.
 *
 * Before running: create the table by running migration
 *   supabase/migrations/006_gym_workout_videos.sql
 * in the Supabase SQL editor, and set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (see supabase/README.md and .env.example).
 * ============================================================================
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedFilePath = path.join(__dirname, '../data/gym-workout-seed.json')

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
    if (key && val && !process.env[key]) process.env[key] = val
  }
}
loadEnvFile()

const isDryRun = process.argv.includes('--dry-run')
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

console.log('────────────────────────────────────────────────────────────')
console.log('⚡ X FIT FORMULA — Production Gym Workout Library Importer')
console.log('────────────────────────────────────────────────────────────')

if (!fs.existsSync(seedFilePath)) {
  console.error(`❌ Seed file not found: ${seedFilePath}`)
  process.exit(1)
}

const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'))

const byLevel = { Beginner: 0, Intermediate: 0, Advanced: 0 }
seedData.forEach((s) => {
  if (byLevel[s.level] !== undefined) byLevel[s.level]++
})

console.log('\n📋 Official Gym Curriculum Scope:')
Object.entries(byLevel).forEach(([lvl, n]) => console.log(`  • ${lvl}: ${n} movements`))
console.log(`  • Total Rows: ${seedData.length}`)
console.log(`  • Unique Movements: ${new Set(seedData.map((s) => s.exercise_name)).size}\n`)

async function run() {
  if (isDryRun) {
    console.log('🧪 DRY RUN — no database writes performed.')
    printSummary({ synced: seedData.length, errors: 0 })
    return
  }

  if (!supabaseUrl || !supabaseKey) {
    console.log('────────────────────────────────────────────────────────────')
    console.log('⚠️  SUPABASE CREDENTIALS NOT FOUND')
    console.log('────────────────────────────────────────────────────────────')
    console.log('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example)')
    console.log('and ensure you have run migration 006_gym_workout_videos.sql.')
    console.log('────────────────────────────────────────────────────────────\n')
    printSummary({ synced: 0, errors: 1 })
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

  // Probe table existence for a friendly error.
  const probe = await supabase.from('gym_workout_videos').select('id').limit(1)
  if (probe.error && /does not exist|relation/i.test(probe.error.message || '')) {
    console.error('❌ Table `gym_workout_videos` does not exist.')
    console.error('   Run migration 006_gym_workout_videos.sql in the Supabase SQL editor first.')
    printSummary({ synced: 0, errors: seedData.length })
    return
  }

  console.log('💾 Syncing gym_workout_videos records...')
  let synced = 0
  let errors = 0

  for (const record of seedData) {
    const { error } = await supabase
      .from('gym_workout_videos')
      .upsert(
        {
          id:                record.id,
          exercise_name:     record.exercise_name,
          slug:              record.slug,
          level:             record.level,
          day:               record.day || null,
          split_name:        record.split_name || null,
          section:           record.section || null,
          sets:              record.sets || null,
          reps:              record.reps || null,
          video_id:          record.video_id || null,
          video_title:       record.video_title || null,
          video_description: record.video_description || null,
          thumbnail_url:     record.thumbnail_url || record.thumbnail_path || null,
          target_muscle:     record.target_muscle || null,
          equipment:         record.equipment || 'Gym',
          instructions:      record.instructions || [],
          form_cues:         record.form_cues || [],
          updated_at:        new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (error) {
      errors++
      console.warn(`  ⚠️  Sync warning for ${record.id}:`, error.message)
    } else {
      synced++
    }
  }

  printSummary({ synced, errors })
}

function printSummary({ synced, errors }) {
  console.log('────────────────────────────────────────────────────────────')
  console.log('📊 GYM WORKOUT LIBRARY IMPORT SUMMARY')
  console.log('────────────────────────────────────────────────────────────')
  console.log(`  • BEGINNER:                     ${byLevel.Beginner}`)
  console.log(`  • INTERMEDIATE:                 ${byLevel.Intermediate}`)
  console.log(`  • ADVANCED:                     ${byLevel.Advanced}`)
  console.log(`  • TOTAL REQUIRED ROWS:          ${seedData.length}`)
  console.log(`  • SYNCED:                       ${synced}`)
  console.log(`  • ERRORS / FAILED:              ${errors}`)
  console.log('────────────────────────────────────────────────────────────\n')
}

run()
