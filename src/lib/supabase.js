/**
 * ============================================================================
 * X FIT FORMULA — Supabase Client, Auth & Database Helpers
 * ============================================================================
 * Architecture:
 *   - When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set → live Supabase
 *   - When not configured → graceful fallback to local seed data (demo/offline mode)
 *
 * Security rules (enforced here):
 *   - VITE_SUPABASE_ANON_KEY only — never service-role in browser code
 *   - Service-role key lives ONLY in scripts/ (Node, not bundled by Vite)
 *   - All writes go through Supabase Auth + RLS
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import seedExercises from '../../data/exercises-seed.json'
import homeWorkoutSeed from '../../data/home-workout-seed.json'
import gymWorkoutSeed from '../../data/gym-workout-seed.json'
import { getOpenSourceDemo } from './openSourceMedia.js'

// ─── Client Initialisation ───────────────────────────────────────────────────

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL     || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('your-anon-key')
)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info('[XFF] Supabase not configured — running in demo/seed mode.')
}

const BUCKET = 'x-fit-formula-exercises'

// ─── Storage URL Resolver ────────────────────────────────────────────────────
/**
 * Converts a storage-relative path to a full public URL.
 * Falls back to local /media/ path for development.
 */
export function getMediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  if (isSupabaseConfigured && supabase) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    if (data?.publicUrl) return data.publicUrl
  }
  return `/media/${path}`
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Sign up a new user. Creates profile via database trigger. */
export async function signUp(email, password, fullName, role = 'client') {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  })
  if (error) throw error
  return data
}

/** Sign in with email + password. */
export async function signIn(email, password) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** Sign in with Google OAuth. */
export async function signInWithGoogle(role = 'client') {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      data: { role },
    },
  })
  if (error) throw error
  return data
}

/** Send SMS OTP to phone number. */
export async function sendMobileOtp(phone, role = 'client') {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
      data: { role },
    },
  })
  if (error) throw error
  return data
}

/** Verify SMS OTP token for phone number. */
export async function verifyMobileOtp(phone, token) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  if (error) throw error
  return data
}

/** Request password reset email. */
export async function resetPassword(email) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}`,
  })
  if (error) throw error
  return data
}

/** Update user password (when in recovery session). */
export async function updatePassword(newPassword) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return data
}

/** Sign out the current session. */
export async function signOut() {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Get the current session (null if not logged in). */
export async function getSession() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** Get the current authenticated user (null if not logged in). */
export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── Profiles ────────────────────────────────────────────────────────────────

/** Fetch a single user profile by UUID. */
export async function getProfile(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('[Supabase] getProfile failed:', err.message)
    return null
  }
}

/** Create or update a profile record. */
export async function upsertProfile(userId, patch) {
  if (!isSupabaseConfigured || !supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('[Supabase] upsertProfile failed:', err.message)
    return null
  }
}

// Helper to derive accurate body_part and equipment from gym/home workout seed items
function inferBodyPart(item) {
  if (item.body_part && item.body_part !== 'Full Body') return item.body_part
  const name = (item.exercise_name || item.name || item.slug || '').toLowerCase()
  const target = (item.target_muscle || item.target || '').toLowerCase()

  // 1. Primary Arms (Biceps, Triceps, Forearms)
  if (
    name.includes('curl') ||
    name.includes('skullcrusher') ||
    name.includes('push-down') ||
    name.includes('pushdown') ||
    name.includes('triceps dip') ||
    name.includes('tricep') ||
    name.includes('forearm') ||
    name.includes('wrist') ||
    name.includes('biceps') ||
    target.includes('biceps') ||
    target.includes('triceps') ||
    target.includes('brachii')
  ) {
    return 'Arms'
  }

  // 2. Primary Chest (Presses, Flyes, Pushups, Pullovers, Crossover)
  if (
    name.includes('bench press') ||
    name.includes('chest') ||
    name.includes('push-up') ||
    name.includes('pushups') ||
    name.includes('fly') ||
    name.includes('flye') ||
    name.includes('butterfly') ||
    name.includes('pullover') ||
    name.includes('crossover') ||
    (name.includes('dumbbell press') && !name.includes('shoulder') && !name.includes('standing') && !name.includes('biceps')) ||
    target.includes('pectoral')
  ) {
    return 'Chest'
  }

  // 3. Primary Legs & Glutes (Squats, Presses, Extensions, Curls, Calves, Lunges)
  if (
    name.includes('squat') ||
    name.includes('leg extension') ||
    name.includes('leg press') ||
    name.includes('leg curl') ||
    name.includes('calf') ||
    name.includes('calves') ||
    name.includes('lunge') ||
    name.includes('deadlift') ||
    target.includes('quad') ||
    target.includes('hamstring') ||
    target.includes('glute') ||
    target.includes('soleus') ||
    target.includes('gastrocnemius')
  ) {
    return 'Legs'
  }

  // 4. Primary Back & Lats (Pulldowns, Rows, Pullups, T-Bar, Cable Pulldown)
  if (
    name.includes('pulldown') ||
    name.includes('pull-up') ||
    name.includes('pullups') ||
    name.includes('t-bar') ||
    (name.includes('row') && !name.includes('upright')) ||
    name.includes('cable machine') ||
    target.includes('latissimus') ||
    target.includes('rhomboid')
  ) {
    return 'Back'
  }

  // 5. Primary Shoulders & Traps (Overhead Press, Raises, Face Pull, Upright Row, Shrugs)
  if (
    name.includes('shoulder') ||
    name.includes('overhead press') ||
    name.includes('military press') ||
    name.includes('face pull') ||
    name.includes('upright row') ||
    name.includes('raise') ||
    name.includes('shrug') ||
    target.includes('deltoid') ||
    target.includes('trapezius')
  ) {
    return 'Shoulders'
  }

  // 6. Primary Core
  if (
    name.includes('plank') ||
    name.includes('crunch') ||
    name.includes('knee raise') ||
    name.includes('leg raise') ||
    name.includes('bike') ||
    target.includes('abdominis') ||
    target.includes('core')
  ) {
    return 'Core'
  }

  // 7. Cardio
  if (name.includes('cardio') || name.includes('walk') || name.includes('treadmill') || name.includes('cycle')) {
    return 'Cardio'
  }

  return 'Chest'
}

function inferEquipment(item) {
  if (!item.equipment) return 'Gym'
  const eq = item.equipment.toLowerCase()
  if (eq.includes('barbell')) return 'Barbell'
  if (eq.includes('dumbbell')) return 'Dumbbells'
  if (eq.includes('cable')) return 'Cable'
  if (eq.includes('machine') || eq.includes('leverage') || eq.includes('bench')) return 'Machine'
  if (eq.includes('bodyweight')) return 'Bodyweight'
  return item.equipment
}

let _cachedUnifiedExercises = null
function getUnifiedExercises() {
  if (_cachedUnifiedExercises) return _cachedUnifiedExercises

  const map = new Map()

  // 1. Base seed exercises
  seedExercises.forEach((ex) => {
    const key = (ex.slug || ex.name).toLowerCase()
    map.set(key, { ...ex })
  })

  // 2. Gym workouts converted to exercises
  gymWorkoutSeed.forEach((item) => {
    const key = (item.slug || item.exercise_name).toLowerCase()
    const bp = inferBodyPart(item)
    const eq = inferEquipment(item)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        id: item.id,
        source_id: `gym-${item.slug}`,
        name: item.exercise_name,
        slug: item.slug,
        body_part: bp,
        target: item.target_muscle || 'Full Body',
        secondary_muscles: [],
        equipment: eq,
        difficulty: item.level || 'Beginner',
        category: 'Gym',
        compound: true,
        instructions: item.instructions || [],
        form_cues: item.form_cues || [],
        day: item.day,
        split_name: item.split_name,
        sets: item.sets,
        reps: item.reps,
        isGymWorkout: true,
      })
    } else {
      map.set(key, {
        ...existing,
        body_part: existing.body_part || bp,
        category: 'Gym',
        day: item.day,
        split_name: item.split_name,
        sets: item.sets,
        reps: item.reps,
        isGymWorkout: true,
      })
    }
  })

  // 3. Home workouts converted to exercises
  homeWorkoutSeed.forEach((item) => {
    const key = (item.slug || item.exercise_name).toLowerCase()
    const bp = inferBodyPart(item)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        id: item.id,
        source_id: `home-${item.slug}`,
        name: item.exercise_name,
        slug: item.slug,
        body_part: bp,
        target: item.target_muscle || 'Full Body',
        secondary_muscles: [],
        equipment: 'Bodyweight',
        difficulty: item.level || 'Beginner',
        category: 'Home',
        compound: true,
        instructions: item.instructions || [],
        form_cues: item.form_cues || [],
        isHomeWorkout: true,
      })
    }
  })

  _cachedUnifiedExercises = Array.from(map.values())
  return _cachedUnifiedExercises
}

// ─── Exercises (Read) ─────────────────────────────────────────────────────────

/**
 * Fetch exercises with optional filters.
 * Returns unified master library merging local verified movements with any Supabase custom exercises.
 */
export async function fetchExercises({
  search     = '',
  bodyPart   = 'All',
  target     = 'All',
  equipment  = 'All',
  difficulty = 'All',
  category   = 'All',
  limit      = 100,
  offset     = 0,
} = {}) {
  let masterList = getUnifiedExercises()

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('active', true)

      if (!error && data && data.length > 0) {
        const map = new Map()
        masterList.forEach((item) => {
          map.set((item.slug || item.name).toLowerCase(), item)
        })
        data.forEach((item) => {
          const key = (item.slug || item.name).toLowerCase()
          if (!map.has(key)) {
            map.set(key, formatExerciseRecord(item))
          }
        })
        masterList = Array.from(map.values())
      }
    } catch (err) {
      console.warn('[Supabase] fetchExercises live query failed, using master list:', err.message)
    }
  }

  let list = [...masterList]

  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter(
      (ex) =>
        (ex.name && ex.name.toLowerCase().includes(q)) ||
        (ex.exercise_name && ex.exercise_name.toLowerCase().includes(q)) ||
        (ex.target && ex.target.toLowerCase().includes(q)) ||
        (ex.target_muscle && ex.target_muscle.toLowerCase().includes(q)) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(q)) ||
        (ex.body_part && ex.body_part.toLowerCase().includes(q)) ||
        (ex.split_name && ex.split_name.toLowerCase().includes(q)) ||
        (ex.secondary_muscles || []).some((m) => m.toLowerCase().includes(q))
    )
  }

  if (bodyPart && bodyPart !== 'All') {
    list = list.filter((ex) => (ex.body_part || inferBodyPart(ex)).toLowerCase() === bodyPart.toLowerCase())
  }
  if (target && target !== 'All') {
    list = list.filter((ex) => (ex.target || ex.target_muscle || '').toLowerCase().includes(target.toLowerCase()))
  }
  if (equipment && equipment !== 'All') {
    list = list.filter((ex) => {
      const eq = (ex.equipment || '').toLowerCase()
      const filterEq = equipment.toLowerCase()
      if (filterEq === 'dumbbells' || filterEq === 'dumbbell') return eq.includes('dumbbell')
      if (filterEq === 'barbell') return eq.includes('barbell')
      if (filterEq === 'cable') return eq.includes('cable')
      if (filterEq === 'machine') return eq.includes('machine') || eq.includes('leverage') || eq.includes('bench')
      if (filterEq === 'bodyweight') return eq.includes('bodyweight')
      return eq.includes(filterEq)
    })
  }
  if (difficulty && difficulty !== 'All') {
    list = list.filter((ex) => (ex.difficulty || ex.level || '').toLowerCase() === difficulty.toLowerCase())
  }
  if (category && category !== 'All') {
    list = list.filter((ex) => {
      const cat = (ex.category || '').toLowerCase()
      const filterCat = category.toLowerCase()
      return cat === filterCat || cat === 'both'
    })
  }

  const totalCount = list.length
  const paginated  = list.slice(offset, offset + limit).map(formatExerciseRecord)
  return { exercises: paginated, totalCount, source: isSupabaseConfigured ? 'supabase_unified' : 'seed_fallback' }
}

/** Fetch a single exercise by UUID, slug, source_id, or name. */
export async function fetchExerciseById(id) {
  if (!id) return null
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`id.eq.${id},slug.eq.${id},source_id.eq.${id}`)
        .maybeSingle()
      if (error) throw error
      if (data) return formatExerciseRecord(data)
    } catch (err) {
      console.warn('[Supabase] fetchExerciseById failed:', err.message)
    }
  }
  const all = getUnifiedExercises()
  const found = all.find(
    (ex) =>
      ex.id === id ||
      ex.slug === id ||
      ex.source_id === id ||
      ex.name.toLowerCase() === String(id).toLowerCase()
  )
  return found ? formatExerciseRecord(found) : null
}

export async function fetchExerciseBySlug(slug) {
  return fetchExerciseById(slug)
}

// ─── Home Workout Videos (Read) ───────────────────────────────────────────────

/**
 * Fetch official Home Workout videos.
 * Supports filtering by level ('Beginner', 'Intermediate', 'Advanced', or 'All') and search.
 */
export async function fetchHomeWorkoutVideos({ level = 'All', search = '' } = {}) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('home_workout_videos').select('*')
      if (level && level !== 'All') {
        query = query.eq('level', level)
      }
      if (search && search.trim()) {
        const term = `%${search.trim()}%`
        query = query.or(`exercise_name.ilike.${term},video_title.ilike.${term},target_muscle.ilike.${term}`)
      }
      query = query.order('id', { ascending: true })

      const { data, error } = await query
      if (error) throw error
      if (data && data.length > 0) {
        return {
          videos: data.map(formatHomeWorkoutRecord),
          totalCount: data.length,
          source: 'supabase',
        }
      }
    } catch (err) {
      console.warn('[Supabase] fetchHomeWorkoutVideos failed, using seed fallback:', err.message)
    }
  }

  // Fallback to official seed dataset
  let list = [...homeWorkoutSeed]
  if (level && level !== 'All') {
    list = list.filter((v) => v.level.toLowerCase() === level.toLowerCase())
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter(
      (v) =>
        v.exercise_name.toLowerCase().includes(q) ||
        v.video_title.toLowerCase().includes(q) ||
        (v.target_muscle && v.target_muscle.toLowerCase().includes(q))
    )
  }

  return {
    videos: list.map(formatHomeWorkoutRecord),
    totalCount: list.length,
    source: 'seed_fallback',
  }
}

/** Fetch a single home workout video by id or slug */
export async function fetchHomeWorkoutVideoById(id) {
  if (!id) return null
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('home_workout_videos')
        .select('*')
        .or(`id.eq.${id},slug.eq.${id},video_id.eq.${id}`)
        .maybeSingle()
      if (error) throw error
      if (data) return formatHomeWorkoutRecord(data)
    } catch (err) {
      console.warn('[Supabase] fetchHomeWorkoutVideoById failed:', err.message)
    }
  }
  const found = homeWorkoutSeed.find(
    (v) =>
      v.id === id ||
      v.slug === id ||
      v.video_id === id ||
      v.exercise_name.toLowerCase() === String(id).toLowerCase()
  )
  return found ? formatHomeWorkoutRecord(found) : null
}

// ─── Gym Workout Videos (Read) ────────────────────────────────────────────────

/**
 * Apply the level / day / search filters against the authoritative gym seed
 * curriculum. This is the single source of truth for what the official Gym
 * Workout Library is expected to contain for any given filter.
 */
function filterGymSeed({ level = 'All', day = 'All', search = '' } = {}) {
  let list = [...gymWorkoutSeed]
  if (level && level !== 'All') {
    list = list.filter((v) => v.level.toLowerCase() === level.toLowerCase())
  }
  if (day && day !== 'All') {
    list = list.filter((v) => (v.day || '').toLowerCase() === day.toLowerCase())
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter(
      (v) =>
        v.exercise_name.toLowerCase().includes(q) ||
        (v.video_title && v.video_title.toLowerCase().includes(q)) ||
        (v.target_muscle && v.target_muscle.toLowerCase().includes(q)) ||
        (v.split_name && v.split_name.toLowerCase().includes(q)) ||
        (v.section && v.section.toLowerCase().includes(q))
    )
  }
  return list
}

/**
 * Fetch official Gym Workout videos.
 * Supports filtering by level ('Beginner', 'Intermediate', 'Advanced', or 'All'),
 * day ('Monday', 'Tuesday', etc. or 'All'), and search.
 *
 * When Supabase is configured the `gym_workout_videos` table is preferred, but it
 * is only trusted when it fully covers the official curriculum for the current
 * (level/day) filter. If the table is missing, empty, or only partially seeded,
 * the returned set can otherwise be incomplete — which made filtered views appear
 * empty even though "All levels" populated. We reconcile against the authoritative
 * seed so a level/day that officially has workouts always shows them.
 */
export async function fetchGymWorkoutVideos({ level = 'All', day = 'All', search = '' } = {}) {
  // Official expected count for this non-search filter (used to validate a DB hit).
  const expectedCount = filterGymSeed({ level, day }).length
  const hasSearch = Boolean(search && search.trim())

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('gym_workout_videos').select('*')
      if (level && level !== 'All') {
        query = query.eq('level', level)
      }
      if (day && day !== 'All') {
        query = query.eq('day', day)
      }
      if (hasSearch) {
        const term = `%${search.trim()}%`
        query = query.or(`exercise_name.ilike.${term},video_title.ilike.${term},target_muscle.ilike.${term},split_name.ilike.${term}`)
      }
      query = query.order('id', { ascending: true })

      const { data, error } = await query
      if (error) throw error
      // Only trust the DB hit when it is non-empty AND — for pure level/day
      // browsing — it covers the full official curriculum. Otherwise fall back
      // to the seed so filtered views are never spuriously empty.
      if (data && data.length > 0 && (hasSearch || data.length >= expectedCount)) {
        return {
          videos: data.map(formatGymWorkoutRecord),
          totalCount: data.length,
          source: 'supabase',
        }
      }
    } catch (err) {
      console.warn('[Supabase] fetchGymWorkoutVideos failed, using seed fallback:', err.message)
    }
  }

  // Fallback to official seed dataset (also used for demo/offline mode)
  const list = filterGymSeed({ level, day, search })

  return {
    videos: list.map(formatGymWorkoutRecord),
    totalCount: list.length,
    source: 'seed_fallback',
  }
}

/** Fetch a single gym workout video by id or slug */
export async function fetchGymWorkoutVideoById(id) {
  if (!id) return null
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('gym_workout_videos')
        .select('*')
        .or(`id.eq.${id},slug.eq.${id},video_id.eq.${id}`)
        .maybeSingle()
      if (error) throw error
      if (data) return formatGymWorkoutRecord(data)
    } catch (err) {
      console.warn('[Supabase] fetchGymWorkoutVideoById failed:', err.message)
    }
  }
  const found = gymWorkoutSeed.find(
    (v) =>
      v.id === id ||
      v.slug === id ||
      v.video_id === id ||
      v.exercise_name.toLowerCase() === String(id).toLowerCase()
  )
  return found ? formatGymWorkoutRecord(found) : null
}

// ─── Workouts (Read) ──────────────────────────────────────────────────────────

/** Fetch all active workouts with their exercises. */
export async function fetchWorkouts() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            id, exercise_order, sets, reps,
            duration_seconds, rest_seconds, notes,
            exercise_name,
            exercise:exercises (*)
          )
        `)
        .eq('active', true)
        .order('name')

      if (error) throw error
      if (data && data.length) return data
    } catch (err) {
      console.warn('[Supabase] fetchWorkouts failed, using demo workouts:', err.message)
    }
  }
  // Demo fallback workouts
  return [
    {
      id: 'w-home-fullbody-1',
      name: 'Foundation Home Bodyweight Protocol',
      slug: 'foundation-home-bodyweight-protocol',
      description: 'Zero-equipment foundational full-body circuit targeting pushing power, knee flexion, and core stability.',
      goal: 'general', difficulty: 'Beginner', category: 'Home',
      duration_minutes: 35, equipment: 'Bodyweight',
      exercises: seedExercises.filter((e) => e.category === 'Home'),
    },
    {
      id: 'w-gym-hypertrophy-1',
      name: 'Upper Hypertrophy Foundation',
      slug: 'upper-hypertrophy-foundation',
      description: 'Gym-based precision protocol for upper body pushing, vertical pulling, and mid-back development.',
      goal: 'muscle', difficulty: 'Beginner', category: 'Gym',
      duration_minutes: 45, equipment: 'Gym',
      exercises: seedExercises.filter((e) => e.category === 'Gym'),
    },
  ]
}

/** Fetch a single workout by ID with its exercises. */
export async function fetchWorkoutById(workoutId) {
  if (!workoutId) return null
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            id, exercise_order, sets, reps,
            duration_seconds, rest_seconds, notes,
            exercise_name,
            exercise:exercises (*)
          )
        `)
        .eq('id', workoutId)
        .maybeSingle()
      if (error) throw error
      return data
    } catch (err) {
      console.warn('[Supabase] fetchWorkoutById failed:', err.message)
    }
  }
  return null
}

// ─── Workouts (Write — trainers only) ────────────────────────────────────────

/**
 * Create a new workout and its exercise list.
 * @param {object} workoutData - { name, slug, goal, difficulty, category, duration_minutes, equipment, created_by, active }
 * @param {Array}  exerciseRows - [{ name, sets, reps, exercise_id? }]
 */
export async function createWorkout(workoutData, exerciseRows = []) {
  if (!isSupabaseConfigured || !supabase) return null
  try {
    const { data: workout, error: wErr } = await supabase
      .from('workouts')
      .insert({ ...workoutData, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (wErr) throw wErr

    if (exerciseRows.length > 0) {
      const rows = exerciseRows
        .filter((ex) => ex.name?.trim())
        .map((ex, i) => ({
          workout_id:      workout.id,
          exercise_id:     ex.exercise_id || null,
          exercise_name:   ex.name || null,
          exercise_order:  i + 1,
          sets:            ex.sets  || '3',
          reps:            ex.reps  || '10-12',
          duration_seconds: ex.duration_seconds || null,
          rest_seconds:    ex.rest_seconds || 60,
          notes:           ex.notes || null,
        }))

      const { error: exErr } = await supabase
        .from('workout_exercises')
        .insert(rows)
      if (exErr) console.warn('[Supabase] createWorkout exercises insert failed:', exErr.message)
    }

    return workout
  } catch (err) {
    console.warn('[Supabase] createWorkout failed:', err.message)
    return null
  }
}

/** Update an existing workout and replace its exercise list. */
export async function updateWorkout(workoutId, workoutData, exerciseRows = []) {
  if (!isSupabaseConfigured || !supabase || !workoutId) return null
  try {
    const { data: workout, error: wErr } = await supabase
      .from('workouts')
      .update({ ...workoutData, updated_at: new Date().toISOString() })
      .eq('id', workoutId)
      .select()
      .single()
    if (wErr) throw wErr

    // Replace exercise list
    await supabase.from('workout_exercises').delete().eq('workout_id', workoutId)

    if (exerciseRows.length > 0) {
      const rows = exerciseRows
        .filter((ex) => ex.name?.trim())
        .map((ex, i) => ({
          workout_id:     workoutId,
          exercise_id:    ex.exercise_id || null,
          exercise_name:  ex.name || null,
          exercise_order: i + 1,
          sets:           ex.sets || '3',
          reps:           ex.reps || '10-12',
          rest_seconds:   ex.rest_seconds || 60,
          notes:          ex.notes || null,
        }))
      await supabase.from('workout_exercises').insert(rows)
    }

    return workout
  } catch (err) {
    console.warn('[Supabase] updateWorkout failed:', err.message)
    return null
  }
}

// ─── Client Workouts (Assignments) ───────────────────────────────────────────

/** Assign a workout to a client. */
export async function assignWorkoutToClient({ clientId, workoutId, assignedBy, scheduledDate }) {
  if (!isSupabaseConfigured || !supabase) return null
  try {
    const { data, error } = await supabase
      .from('client_workouts')
      .insert({
        client_id:      clientId,
        workout_id:     workoutId,
        assigned_by:    assignedBy || null,
        scheduled_date: scheduledDate || null,
        status:         'assigned',
      })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('[Supabase] assignWorkoutToClient failed:', err.message)
    return null
  }
}

/** Fetch all workouts assigned to a specific client. */
export async function fetchClientWorkouts(clientId) {
  if (!isSupabaseConfigured || !supabase || !clientId) return []
  try {
    const { data, error } = await supabase
      .from('client_workouts')
      .select(`
        *,
        workout:workouts (
          *,
          workout_exercises (
            id, exercise_order, sets, reps,
            duration_seconds, rest_seconds, notes,
            exercise_name,
            exercise:exercises (*)
          )
        )
      `)
      .eq('client_id', clientId)
      .order('scheduled_date', { ascending: true })
    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('[Supabase] fetchClientWorkouts failed:', err.message)
    return []
  }
}

/** Update the status of a client workout assignment. */
export async function updateClientWorkoutStatus(assignmentId, status) {
  if (!isSupabaseConfigured || !supabase || !assignmentId) return null
  const validStatuses = ['assigned', 'in_progress', 'completed', 'skipped']
  if (!validStatuses.includes(status)) {
    console.warn('[Supabase] Invalid status:', status)
    return null
  }
  try {
    const { data, error } = await supabase
      .from('client_workouts')
      .update({
        status,
        completed_at:  status === 'completed' ? new Date().toISOString() : null,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('[Supabase] updateClientWorkoutStatus failed:', err.message)
    return null
  }
}

// ─── Workout Progress ─────────────────────────────────────────────────────────

/** Log exercise progress for a workout session. */
export async function logWorkoutProgress({
  clientId, workoutId, exerciseId, exerciseName,
  completed, setsCompleted, repsCompleted, durationSeconds, notes,
}) {
  if (!isSupabaseConfigured || !supabase) return null
  try {
    const { data, error } = await supabase
      .from('workout_progress')
      .insert({
        client_id:        clientId,
        workout_id:       workoutId,
        exercise_id:      exerciseId || null,
        exercise_name:    exerciseName || null,
        completed:        completed ?? false,
        sets_completed:   setsCompleted || null,
        reps_completed:   repsCompleted || null,
        duration_seconds: durationSeconds || null,
        notes:            notes || null,
        completed_at:     completed ? new Date().toISOString() : null,
      })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('[Supabase] logWorkoutProgress failed:', err.message)
    return null
  }
}

/** Fetch workout progress for a client, optionally filtered by workout. */
export async function fetchWorkoutProgress(clientId, workoutId = null) {
  if (!isSupabaseConfigured || !supabase || !clientId) return []
  try {
    let query = supabase
      .from('workout_progress')
      .select('*')
      .eq('client_id', clientId)
    if (workoutId) query = query.eq('workout_id', workoutId)
    query = query.order('completed_at', { ascending: false })
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('[Supabase] fetchWorkoutProgress failed:', err.message)
    return []
  }
}

// ─── Trainer–Client Relationship ─────────────────────────────────────────────

/** Fetch all clients assigned to a trainer. */
export async function fetchTrainerClients(trainerId) {
  if (!isSupabaseConfigured || !supabase || !trainerId) return []
  try {
    const { data, error } = await supabase
      .from('trainer_clients')
      .select('client_id, created_at, client:profiles!trainer_clients_client_id_fkey(*)')
      .eq('trainer_id', trainerId)
    if (error) throw error
    return (data || []).map((row) => row.client).filter(Boolean)
  } catch (err) {
    console.warn('[Supabase] fetchTrainerClients failed:', err.message)
    return []
  }
}

/** Create a trainer↔client relationship. */
export async function addTrainerClientRelationship(trainerId, clientId) {
  if (!isSupabaseConfigured || !supabase) return null
  try {
    const { data, error } = await supabase
      .from('trainer_clients')
      .upsert({ trainer_id: trainerId, client_id: clientId }, { onConflict: 'trainer_id,client_id' })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('[Supabase] addTrainerClientRelationship failed:', err.message)
    return null
  }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/** Normalise a raw database exercise record into the standard app shape. */
function formatExerciseRecord(item) {
  const openSourceDemo = getOpenSourceDemo(item.slug)
  const defaultThumb = openSourceDemo?.frames?.[0] || null
  const resolvedVideo = item.video_url || openSourceDemo?.videoUrl || (item.male_video_path ? getMediaUrl(item.male_video_path) : null)
  return {
    ...item,
    maleVideoUrl:       resolvedVideo || getMediaUrl(item.male_video_path || item.maleVideoUrl),
    femaleVideoUrl:     resolvedVideo || getMediaUrl(item.female_video_path || item.femaleVideoUrl),
    videoUrl:           resolvedVideo,
    video_url:          resolvedVideo,
    maleThumbnailUrl:   item.maleThumbnailUrl || defaultThumb || getMediaUrl(item.male_thumbnail_path),
    femaleThumbnailUrl: item.femaleThumbnailUrl || defaultThumb || getMediaUrl(item.female_thumbnail_path),
    thumbnailUrl:       item.thumbnailUrl || defaultThumb || getMediaUrl(item.male_thumbnail_path || item.female_thumbnail_path),
  }
}

/** Normalise a raw home_workout_videos record into standard app shape. */
function formatHomeWorkoutRecord(item) {
  const openSourceDemo = getOpenSourceDemo(item.slug)
  const defaultThumb = openSourceDemo?.frames?.[0] || null
  const thumbPath = item.thumbnail_url || item.thumbnail_path || `thumbnails/home-workouts/${item.slug}.svg`
  const resolvedVideo = item.video_url || openSourceDemo?.videoUrl || (item.storage_path ? getMediaUrl(item.storage_path) : null)
  return {
    ...item,
    id: item.id,
    name: item.exercise_name,
    exercise_name: item.exercise_name,
    slug: item.slug,
    level: item.level,
    videoUrl: resolvedVideo,
    video_url: resolvedVideo,
    videoId: item.video_id,
    title: item.video_title || `${item.level} ${item.exercise_name} Tutorial`,
    video_title: item.video_title || `${item.level} ${item.exercise_name} Tutorial`,
    description: item.video_description || '',
    video_description: item.video_description || '',
    thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || defaultThumb || getMediaUrl(thumbPath),
    duration: item.duration || '02:00',
    target: item.target_muscle || 'Full Body',
    target_muscle: item.target_muscle || 'Full Body',
    equipment: item.equipment || 'Bodyweight',
    difficulty: item.level,
    category: 'Home',
    instructions: item.instructions || [],
    form_cues: item.form_cues || [],
    isHomeWorkout: true,
  }
}

/** Normalise a raw gym_workout_videos record into standard app shape. */
function formatGymWorkoutRecord(item) {
  const openSourceDemo = getOpenSourceDemo(item.slug)
  const defaultThumb = openSourceDemo?.frames?.[0] || null
  const thumbPath = item.thumbnail_url || item.thumbnail_path || `thumbnails/gym-workouts/${item.slug}.jpg`
  const resolvedVideo = item.video_url || openSourceDemo?.videoUrl || (item.storage_path ? getMediaUrl(item.storage_path) : null)
  return {
    ...item,
    id: item.id,
    name: item.exercise_name,
    exercise_name: item.exercise_name,
    slug: item.slug,
    level: item.level,
    day: item.day || '',
    split_name: item.split_name || '',
    section: item.section || '',
    sets: item.sets || '3 sets',
    reps: item.reps || '8-12 reps',
    videoUrl: resolvedVideo,
    video_url: resolvedVideo,
    videoId: item.video_id,
    title: item.video_title || `${item.level} ${item.exercise_name}`,
    video_title: item.video_title || `${item.level} ${item.exercise_name}`,
    description: item.video_description || '',
    video_description: item.video_description || '',
    thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || defaultThumb || getMediaUrl(thumbPath),
    duration: item.duration || '02:00',
    target: item.target_muscle || 'Full Body',
    target_muscle: item.target_muscle || 'Full Body',
    equipment: item.equipment || 'Gym',
    difficulty: item.level,
    category: 'Gym',
    instructions: item.instructions || [],
    form_cues: item.form_cues || [],
    isGymWorkout: true,
  }
}
