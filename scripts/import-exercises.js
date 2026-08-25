#!/usr/bin/env node
/**
 * ============================================================================
 * X FIT FORMULA — Reusable Exercise & Workout Import Utility
 * ============================================================================
 * Usage:
 *   node scripts/import-exercises.js [--dry-run]
 *
 * Environment variables:
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (Privileged service-role for admin DB operations)
 * ============================================================================
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedFilePath = path.join(__dirname, '../data/exercises-seed.json')

// Auto-load .env.local for local runs
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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

console.log('────────────────────────────────────────────────────────────')
console.log('⚡ X FIT FORMULA — Exercise Database Importer')
console.log('────────────────────────────────────────────────────────────')

if (!fs.existsSync(seedFilePath)) {
  console.error(`❌ Seed file not found at: ${seedFilePath}`)
  process.exit(1)
}

const rawSeed = fs.readFileSync(seedFilePath, 'utf8')
let exercises = []
try {
  exercises = JSON.parse(rawSeed)
} catch (err) {
  console.error(`❌ Failed to parse JSON in ${seedFilePath}:`, err.message)
  process.exit(1)
}

console.log(`📦 Loaded ${exercises.length} exercise records from seed dataset.`)

if (isDryRun) {
  console.log('🔍 DRY RUN MODE ACTIVATED — No database modifications will occur.')
}

const stats = {
  total: exercises.length,
  valid: 0,
  invalid: 0,
  inserted: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
}

// ── Validation helper ────────────────────────────────────────────────────────
function validateExercise(ex, index) {
  const errors = []
  if (!ex.source_id) errors.push('Missing source_id')
  if (!ex.name) errors.push('Missing name')
  if (!ex.slug) errors.push('Missing slug')
  if (!ex.body_part) errors.push('Missing body_part')
  if (!ex.target) errors.push('Missing target')
  if (!ex.equipment) errors.push('Missing equipment')
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(ex.difficulty)) {
    errors.push(`Invalid difficulty: "${ex.difficulty}"`)
  }
  if (!['Home', 'Gym', 'Both'].includes(ex.category)) {
    errors.push(`Invalid category: "${ex.category}"`)
  }
  if (!Array.isArray(ex.instructions) || ex.instructions.length === 0) {
    errors.push('Missing or empty instructions array')
  }
  if (!ex.metadata_license) errors.push('Missing metadata_license')
  if (!ex.media_license) errors.push('Missing media_license')

  if (errors.length > 0) {
    console.error(`❌ Record #${index + 1} (${ex.name || 'unnamed'}):`, errors.join(', '))
    return false
  }
  return true
}

async function run() {
  const validatedList = []
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i]
    if (validateExercise(ex, i)) {
      stats.valid++
      validatedList.push(ex)
    } else {
      stats.invalid++
    }
  }

  console.log(`✅ Validation completed: ${stats.valid} valid, ${stats.invalid} invalid.`)

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n⚠️  Supabase environment variables not configured.')
    console.log('   Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to perform remote database sync.')
    console.log('   All validated seed data is ready for offline/local use.')
    printReport()
    return
  }

  if (isDryRun) {
    console.log('\n[Dry Run] Validated dataset ready for upload.')
    printReport()
    return
  }

  console.log(`\nConnecting to Supabase at: ${supabaseUrl}`)
  const supabase = createClient(supabaseUrl, supabaseKey)

  for (const ex of validatedList) {
    try {
      const record = {
        source_id: ex.source_id,
        name: ex.name,
        slug: ex.slug,
        body_part: ex.body_part,
        target: ex.target,
        secondary_muscles: ex.secondary_muscles || [],
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        category: ex.category,
        compound: Boolean(ex.compound),
        unilateral: Boolean(ex.unilateral),
        short_description: ex.short_description || '',
        instructions: ex.instructions || [],
        form_cues: ex.form_cues || [],
        common_mistakes: ex.common_mistakes || [],
        breathing: ex.breathing || '',
        male_video_path: ex.male_video_path || null,
        female_video_path: ex.female_video_path || null,
        male_thumbnail_path: ex.male_thumbnail_path || null,
        female_thumbnail_path: ex.female_thumbnail_path || null,
        source_name: ex.source_name || 'Free Exercise DB with Videos',
        source_url: ex.source_url || 'https://github.com/arhxam/free-exercise-db-with-videos',
        metadata_license: ex.metadata_license || 'MIT',
        media_license: ex.media_license || 'Verified Open-Access',
        attribution_required: ex.attribution_required !== false,
        media_usage_verified: ex.media_usage_verified !== false,
        active: ex.active !== false,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('exercises')
        .upsert(record, { onConflict: 'source_id' })
        .select('id, name')

      if (error) {
        console.error(`❌ Error importing "${ex.name}":`, error.message)
        stats.errors++
      } else {
        console.log(`  ✓ Synced: ${ex.name} (Source ID: ${ex.source_id})`)
        stats.inserted++
      }
    } catch (err) {
      console.error(`❌ Unexpected error for "${ex.name}":`, err.message)
      stats.errors++
    }
  }

  printReport()
}

function printReport() {
  console.log('\n────────────────────────────────────────────────────────────')
  console.log('📊 IMPORT EXECUTION SUMMARY')
  console.log('────────────────────────────────────────────────────────────')
  console.log(`Total Records:    ${stats.total}`)
  console.log(`Valid Records:    ${stats.valid}`)
  console.log(`Invalid Records:  ${stats.invalid}`)
  console.log(`Synced Records:   ${stats.inserted}`)
  console.log(`Errors / Failed:  ${stats.errors}`)
  console.log('────────────────────────────────────────────────────────────\n')
}

run()
