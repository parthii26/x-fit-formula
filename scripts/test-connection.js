#!/usr/bin/env node
/**
 * ============================================================================
 * X FIT FORMULA — Supabase Connection Test
 * ============================================================================
 * Usage:
 *   node scripts/test-connection.js
 *
 * Tests:
 *   1. Supabase client connects
 *   2. exercises table is accessible and returns records
 *   3. workouts table is accessible
 *   4. Storage bucket exists and is reachable
 *
 * Logs only safe diagnostic info — never logs credentials.
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load .env.local for local runs ───────────────────────────────────────────
function loadEnvFile() {
  const envPath = resolve(__dirname, '../.env.local')
  if (!existsSync(envPath)) return

  const lines = readFileSync(envPath, 'utf8').split('\n')
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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

const BUCKET_NAME = 'x-fit-formula-exercises'

// ── Helpers ───────────────────────────────────────────────────────────────────
const pass  = (msg) => console.log(`  ✅ PASS  ${msg}`)
const fail  = (msg) => console.log(`  ❌ FAIL  ${msg}`)
const info  = (msg) => console.log(`  ℹ️  INFO  ${msg}`)
const warn  = (msg) => console.log(`  ⚠️  WARN  ${msg}`)

// Safely print URL without exposing full key
function safeUrl(url) {
  if (!url) return '(not set)'
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.hostname}`
  } catch { return url.slice(0, 30) + '...' }
}
function safeKey(key) {
  if (!key) return '(not set)'
  return `${key.slice(0, 12)}...${key.slice(-4)} (${key.length} chars)`
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n────────────────────────────────────────────────────────────')
  console.log('🔌 X FIT FORMULA — Supabase Connection Diagnostic')
  console.log('────────────────────────────────────────────────────────────\n')

  // 1. Environment variables
  console.log('[ Test 1 ] Environment Variables')
  if (supabaseUrl) {
    pass(`SUPABASE_URL: ${safeUrl(supabaseUrl)}`)
  } else {
    fail('SUPABASE_URL not set — check .env.local')
    process.exit(1)
  }

  if (supabaseKey) {
    pass(`Key:          ${safeKey(supabaseKey)}`)
  } else {
    fail('No Supabase key found — check .env.local')
    process.exit(1)
  }

  const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  info(`Key type:     ${isServiceRole ? 'service_role (full access)' : 'anon (RLS applies)'}`)
  console.log()

  // 2. Client connection
  console.log('[ Test 2 ] Supabase Client Connection')
  let supabase
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
    pass('Client created successfully')
  } catch (err) {
    fail(`Client creation failed: ${err.message}`)
    process.exit(1)
  }
  console.log()

  // 3. exercises table
  console.log('[ Test 3 ] Exercises Table')
  try {
    const { data, error, count } = await supabase
      .from('exercises')
      .select('id, name, slug, active', { count: 'exact' })
      .eq('active', true)
      .limit(3)

    if (error) throw error
    pass(`Query OK — ${count ?? (data?.length ?? 0)} active exercise(s) found`)
    if (data?.length > 0) {
      data.forEach((ex) => info(`  • ${ex.name} (${ex.slug})`))
    } else {
      warn('Table accessible but empty — run: node scripts/import-exercises.js')
    }
  } catch (err) {
    fail(`exercises query failed: ${err.message}`)
    if (err.message.includes('does not exist')) {
      warn('Run migrations first: supabase/migrations/001_exercises_workouts.sql')
    }
  }
  console.log()

  // 4. workouts table
  console.log('[ Test 4 ] Workouts Table')
  try {
    const { data, error, count } = await supabase
      .from('workouts')
      .select('id, name', { count: 'exact' })
      .limit(3)

    if (error) throw error
    pass(`Query OK — ${count ?? (data?.length ?? 0)} workout(s) found`)
  } catch (err) {
    fail(`workouts query failed: ${err.message}`)
  }
  console.log()

  // 5. profiles table
  console.log('[ Test 5 ] Profiles Table')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1)

    if (error) throw error
    pass('profiles table accessible')
  } catch (err) {
    if (err.message?.includes('does not exist')) {
      warn('profiles table missing — run: 002_profiles.sql migration')
    } else if (err.message?.includes('RLS')) {
      pass('profiles table exists (RLS blocking anon access — expected behaviour)')
    } else {
      fail(`profiles query failed: ${err.message}`)
    }
  }
  console.log()

  // 6. Storage bucket
  console.log('[ Test 6 ] Storage Bucket')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) throw error

    const bucket = buckets?.find((b) => b.name === BUCKET_NAME)
    if (bucket) {
      pass(`Bucket "${BUCKET_NAME}" exists (public: ${bucket.public})`)

      // Count files
      const { data: files } = await supabase.storage
        .from(BUCKET_NAME)
        .list('videos/male', { limit: 5 })
      const fileCount = files?.length ?? 0
      info(`videos/male/ — ${fileCount} file(s) found`)
    } else {
      warn(`Bucket "${BUCKET_NAME}" not found — run: 004_storage.sql migration`)
    }
  } catch (err) {
    fail(`Storage check failed: ${err.message}`)
  }
  console.log()

  // 7. Auth service
  console.log('[ Test 7 ] Auth Service')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    pass('Auth service reachable')
    info(`Session: ${data?.session ? 'active' : 'none (expected for service-role test)'}`)
  } catch (err) {
    fail(`Auth service check failed: ${err.message}`)
  }

  console.log('\n────────────────────────────────────────────────────────────')
  console.log('✅ Connection diagnostic complete.')
  console.log('────────────────────────────────────────────────────────────\n')
}

run()
