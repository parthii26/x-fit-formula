#!/usr/bin/env node
/**
 * ============================================================================
 * X FIT FORMULA — Exercise Media Verification Utility
 * ============================================================================
 * Usage:
 *   node scripts/verify-exercise-media.js [--dry-run]
 *
 * Verifies:
 *   - Exercise record exists in Supabase (or seed)
 *   - male_video_path / female_video_path fields are set
 *   - male_thumbnail_path / female_thumbnail_path fields are set
 *   - Supabase Storage public URLs resolve with HTTP 200
 *   - Reports missing / broken / unreachable media
 * ============================================================================
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
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
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY
const BUCKET_NAME = 'x-fit-formula-exercises'

console.log('────────────────────────────────────────────────────────────')
console.log('🔍 X FIT FORMULA — Media Verification Utility')
console.log('────────────────────────────────────────────────────────────')

// ── Load seed data ────────────────────────────────────────────────────────────
if (!fs.existsSync(seedFilePath)) {
  console.error(`❌ Seed file not found: ${seedFilePath}`)
  process.exit(1)
}

let seedExercises = []
try {
  seedExercises = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'))
} catch (err) {
  console.error('❌ Failed to parse exercises-seed.json:', err.message)
  process.exit(1)
}

// ── HTTP HEAD check ──────────────────────────────────────────────────────────
function checkUrl(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http
    const req = lib.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode })
    })
    req.on('error', (err) => resolve({ ok: false, status: 0, error: err.message }))
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: 'Timeout' }) })
    req.end()
  })
}

// ── Resolve Supabase Storage public URL ───────────────────────────────────────
function buildPublicUrl(storagePath) {
  if (!supabaseUrl) return null
  const base = supabaseUrl.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`
}

// ── Report counters ──────────────────────────────────────────────────────────
const stats = {
  total: 0,
  recordsOk: 0,
  recordsMissing: 0,
  pathsSet: 0,
  pathsMissing: 0,
  urlsChecked: 0,
  urlsOk: 0,
  urlsBroken: 0,
  localFilesPresent: 0,
  localFilesMissing: 0,
}

const issues = []

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  // Decide which record list to verify against
  let exercises = seedExercises
  let source = 'seed_data'

  if (supabaseUrl && supabaseKey && !isDryRun) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase
        .from('exercises')
        .select('source_id, name, slug, male_video_path, female_video_path, male_thumbnail_path, female_thumbnail_path')
        .eq('active', true)
        .order('name')

      if (error) throw error
      if (data && data.length > 0) {
        exercises = data
        source = 'supabase'
        console.log(`📦 Loaded ${exercises.length} records from Supabase.`)
      } else {
        console.log('⚠️  No records found in Supabase — falling back to seed data.')
      }
    } catch (err) {
      console.warn(`⚠️  Supabase query failed (${err.message}), falling back to seed data.`)
    }
  } else {
    console.log(`📋 Source: ${isDryRun ? '[Dry Run] ' : ''}Seed data (${exercises.length} exercises)`)
    if (!supabaseUrl) console.log('   Set SUPABASE_URL to verify live database records instead.')
  }

  console.log('')

  for (const ex of exercises) {
    stats.total++
    const name = ex.name || ex.source_id || 'Unknown'
    console.log(`• ${name}`)

    const mediaPaths = [
      { label: 'Male Video',        path: ex.male_video_path,      type: 'video' },
      { label: 'Female Video',      path: ex.female_video_path,    type: 'video' },
      { label: 'Male Thumbnail',    path: ex.male_thumbnail_path,  type: 'image' },
      { label: 'Female Thumbnail',  path: ex.female_thumbnail_path, type: 'image' },
    ]

    for (const item of mediaPaths) {
      if (!item.path) {
        stats.pathsMissing++
        const issue = `  ⚠️  ${item.label}: path not set`
        console.log(issue)
        issues.push({ exercise: name, field: item.label, issue: 'Path not set in record' })
        continue
      }

      stats.pathsSet++

      // Check local public/media fallback
      const localPath = path.join(__dirname, '../public/media', item.path)
      if (fs.existsSync(localPath)) {
        stats.localFilesPresent++
        console.log(`  ✓ Local  ${item.label}: ${item.path}`)
      } else {
        stats.localFilesMissing++
        console.log(`  ○ Remote ${item.label}: ${item.path} (no local fallback)`)
      }

      // Check Supabase Storage public URL reachability (skip in dry-run)
      if (isDryRun || !supabaseUrl) continue

      const publicUrl = buildPublicUrl(item.path)
      if (!publicUrl) continue

      stats.urlsChecked++
      const result = await checkUrl(publicUrl)
      if (result.ok) {
        stats.urlsOk++
        console.log(`  ✓ URL OK  [${result.status}] ${publicUrl.split('/').slice(-3).join('/')}`)
      } else {
        stats.urlsBroken++
        const issue = `  ❌ URL FAIL [${result.status || result.error}] ${item.path}`
        console.log(issue)
        issues.push({ exercise: name, field: item.label, issue: `HTTP ${result.status || result.error}`, url: publicUrl })
      }
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n────────────────────────────────────────────────────────────')
  console.log('📊 VERIFICATION REPORT')
  console.log(`   Source:              ${source}`)
  console.log('────────────────────────────────────────────────────────────')
  console.log(`Exercises Checked:   ${stats.total}`)
  console.log(`Media Paths Set:     ${stats.pathsSet}`)
  console.log(`Media Paths Missing: ${stats.pathsMissing}`)
  console.log(`Local Files Found:   ${stats.localFilesPresent}`)
  console.log(`Local Files Missing: ${stats.localFilesMissing}`)
  if (!isDryRun && supabaseUrl) {
    console.log(`URLs Verified:       ${stats.urlsChecked}`)
    console.log(`URLs Healthy:        ${stats.urlsOk}`)
    console.log(`URLs Broken:         ${stats.urlsBroken}`)
  }
  console.log('────────────────────────────────────────────────────────────')

  if (issues.length > 0) {
    console.log(`\n⚠️  ${issues.length} issue(s) found:\n`)
    issues.forEach((iss, i) => {
      console.log(`  ${i + 1}. [${iss.exercise}] ${iss.field}: ${iss.issue}`)
      if (iss.url) console.log(`     URL: ${iss.url}`)
    })
  } else {
    console.log('\n✅ All verified paths appear healthy.\n')
  }

  if (stats.localFilesMissing > 0 && stats.pathsMissing === 0) {
    console.log('ℹ️  Missing local files means videos are hosted on Supabase Storage.')
    console.log('   Run upload-exercise-media.js to push local files to storage.\n')
  }
}

run()
