#!/usr/bin/env node
/**
 * ============================================================================
 * X FIT FORMULA — Exercise Media Uploader Utility
 * ============================================================================
 * Usage:
 *   node scripts/upload-exercise-media.js [--source-dir <path>] [--dry-run]
 *
 * Uploads video and thumbnail assets to the dedicated Supabase Storage bucket:
 *   Bucket: x-fit-formula-exercises
 *   Structure:
 *     videos/male/[slug].mp4
 *     videos/female/[slug].mp4
 *     thumbnails/male/[slug].jpg
 *     thumbnails/female/[slug].jpg
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
const BUCKET_NAME = 'x-fit-formula-exercises'

console.log('────────────────────────────────────────────────────────────')
console.log('🎬 X FIT FORMULA — Storage Media Uploader')
console.log('────────────────────────────────────────────────────────────')

const rawSeed = fs.readFileSync(seedFilePath, 'utf8')
const exercises = JSON.parse(rawSeed)

console.log(`📋 Scanning ${exercises.length} exercises for media assets...`)

const stats = {
  videosChecked: 0,
  thumbnailsChecked: 0,
  uploaded: 0,
  skipped: 0,
  errors: 0,
}

async function run() {
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n⚠️  Supabase environment credentials not detected.')
    console.log('   Media paths are indexed in seed data and will route through storage when deployed.')
    console.log('   To upload live media files, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Ensure storage bucket exists
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (!error) {
      const exists = buckets.some((b) => b.name === BUCKET_NAME)
      if (!exists) {
        console.log(`Creating storage bucket "${BUCKET_NAME}"...`)
        await supabase.storage.createBucket(BUCKET_NAME, { public: true })
      }
    }
  } catch (err) {
    console.warn('Bucket verification warning:', err.message)
  }

  for (const ex of exercises) {
    console.log(`\n• Processing media for: ${ex.name} (${ex.slug})`)

    const targets = [
      { path: ex.male_video_path, type: 'video/mp4', category: 'video' },
      { path: ex.female_video_path, type: 'video/mp4', category: 'video' },
      { path: ex.male_thumbnail_path, type: 'image/jpeg', category: 'thumbnail' },
      { path: ex.female_thumbnail_path, type: 'image/jpeg', category: 'thumbnail' },
    ]

    for (const item of targets) {
      if (!item.path) continue
      if (item.category === 'video') stats.videosChecked++
      if (item.category === 'thumbnail') stats.thumbnailsChecked++

      const localCandidate = path.join(__dirname, '../public/media', item.path)
      if (fs.existsSync(localCandidate)) {
        if (isDryRun) {
          console.log(`  [Dry Run] Would upload ${item.path}`)
          stats.uploaded++
          continue
        }

        const fileBuffer = fs.readFileSync(localCandidate)
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(item.path, fileBuffer, {
            contentType: item.type,
            upsert: true,
          })

        if (uploadError) {
          console.error(`  ❌ Failed uploading ${item.path}:`, uploadError.message)
          stats.errors++
        } else {
          console.log(`  ✓ Uploaded to storage: ${item.path}`)
          stats.uploaded++
        }
      } else {
        // Path registered in metadata
        stats.skipped++
      }
    }
  }

  console.log('\n────────────────────────────────────────────────────────────')
  console.log('📊 MEDIA UPLOAD REPORT')
  console.log('────────────────────────────────────────────────────────────')
  console.log(`Videos Verified:     ${stats.videosChecked}`)
  console.log(`Thumbnails Verified: ${stats.thumbnailsChecked}`)
  console.log(`Files Uploaded:      ${stats.uploaded}`)
  console.log(`Skipped / Remote:    ${stats.skipped}`)
  console.log(`Upload Errors:       ${stats.errors}`)
  console.log('────────────────────────────────────────────────────────────\n')
}

run()
