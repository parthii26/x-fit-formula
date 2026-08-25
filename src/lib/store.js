// ─── Mock backend: localStorage-backed store with seeded demo data ─────────
import { generatePlan } from './planGenerator.js'

const KEY = 'xff-db-v2'

export function isoDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function dateLabel(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function seedClient(id, profile, opts = {}) {
  const base = {
    id,
    role: 'client',
    onboarded: true,
    profile,
    plan: null,          // trainer-assigned (or auto) weekly plan
    planStatus: 'pending', // 'pending' | 'assigned'
    planMeta: null,
    completed: {},       // { Monday: true, ... } for current week
    weightLog: [],
    checkIns: [],        // daily diet + workout progress logs
    messages: [],
    joined: opts.joined || '2026-07-01',
    lastActive: opts.lastActive || '2 days ago',
  }
  const c = { ...base, ...opts.overrides }
  if (opts.autoPlan) {
    const gen = generatePlan(profile)
    c.plan = gen.week
    c.planStatus = 'assigned'
    c.planMeta = { rx: gen.rx, volumeNote: gen.volumeNote, split: gen.split, assignedBy: 'Coach Vikram' }
  }
  return c
}

function seed() {
  const clients = [
    seedClient('c-ananya', {
      name: 'Ananya Rao', age: '27', height: '162', heightUnit: 'cm', weight: '61', weightUnit: 'kg',
      gender: 'women', lifestyle: 'desk', injuries: 'Lower back pain from long sitting hours',
      goal: 'fatloss', equipment: 'gym', experience: 'intermediate', daysPerWeek: 4,
    }, {
      autoPlan: true, joined: '2026-05-12', lastActive: 'Today',
      overrides: {
        completed: { Monday: true, Tuesday: true },
        weightLog: [
          { date: 'Jul 20', value: 63.2 }, { date: 'Jul 27', value: 62.6 },
          { date: 'Aug 3', value: 62.1 }, { date: 'Aug 10', value: 61.4 }, { date: 'Aug 16', value: 61.0 },
        ],
        checkIns: [
          {
            id: 'ci-1', date: isoDate(-2), session: 'Completed as programmed', energy: 'high',
            meals: 'Breakfast: oats + whey. Lunch: dal, rice, paneer. Dinner: grilled chicken salad. Snacks: almonds, one filter coffee.',
            protein: '110', calories: '1650', water: '3', sleep: '7.5', weight: '61.2',
            workoutNotes: 'Hip thrusts felt strong. Added 2.5 kg on the final set.',
            status: 'reviewed',
            trainerNote: 'Good execution. Keep the hip thrust load — one more week before we push again.',
          },
          {
            id: 'ci-2', date: isoDate(-1), session: 'Completed with modifications', energy: 'medium',
            meals: 'Breakfast: poha. Lunch: office canteen thali. Dinner: soup + toast. Ate out at lunch, portions were large.',
            protein: '85', calories: '1900', water: '2.5', sleep: '6',
            workoutNotes: 'Cut cardio finisher short — lower back felt tight after rows.',
            status: 'new',
          },
        ],
        messages: [
          { from: 'client', text: 'Hi Coach! Lower back felt a bit tight after Monday\u2019s session.', ts: 'Aug 14, 9:12 AM' },
          { from: 'trainer', text: 'Noted, Ananya. Swap Romanian deadlifts for hip thrusts this week and keep the core work strict. How\u2019s the tightness on a 1\u201310 scale?', ts: 'Aug 14, 11:40 AM' },
          { from: 'client', text: 'Around a 3 now, much better after stretching. Thanks!', ts: 'Aug 15, 8:05 AM' },
        ],
      },
    }),
    seedClient('c-rohan', {
      name: 'Rohan Mehta', age: '34', height: '178', heightUnit: 'cm', weight: '84', weightUnit: 'kg',
      gender: 'men', lifestyle: 'desk', injuries: 'Right shoulder impingement (avoid overhead pressing)',
      goal: 'muscle', equipment: 'dumbbells', experience: 'beginner', daysPerWeek: 3,
    }, {
      joined: '2026-08-09', lastActive: 'Yesterday',
      overrides: {
        messages: [
          { from: 'client', text: 'Just finished onboarding \u2014 excited to start! FYI my shoulder acts up on overhead work.', ts: 'Aug 12, 6:30 PM' },
        ],
      },
    }),
    seedClient('c-priya', {
      name: 'Priya Nair', age: '22', height: '158', heightUnit: 'cm', weight: '52', weightUnit: 'kg',
      gender: 'women', lifestyle: 'studying', injuries: '',
      goal: 'general', equipment: 'bodyweight', experience: 'beginner', daysPerWeek: 3,
    }, {
      autoPlan: true, joined: '2026-06-28', lastActive: '3 days ago',
      overrides: { completed: { Monday: true } },
    }),
    seedClient('c-karan', {
      name: 'Karan Singh', age: '41', height: '183', heightUnit: 'cm', weight: '92', weightUnit: 'kg',
      gender: 'men', lifestyle: 'active', injuries: 'Old ACL reconstruction (left knee) \u2014 no deep pistol squats',
      goal: 'strength', equipment: 'gym', experience: 'advanced', daysPerWeek: 5,
    }, {
      autoPlan: true, joined: '2026-03-02', lastActive: 'Today',
      overrides: {
        completed: { Monday: true, Tuesday: true, Wednesday: true },
        messages: [
          { from: 'trainer', text: 'Big week, Karan. We\u2019re testing squat triples on Friday \u2014 sleep well Thursday.', ts: 'Aug 13, 7:00 PM' },
          { from: 'client', text: 'Locked in. Knee sleeve packed.', ts: 'Aug 13, 7:22 PM' },
        ],
        checkIns: [
          {
            id: 'ci-3', date: isoDate(-1), session: 'Completed as programmed', energy: 'high',
            meals: 'High day: eggs + toast, chicken rice bowl, steak and potatoes, curd. Hit all planned meals.',
            protein: '190', calories: '3100', water: '4', sleep: '8', weight: '92.0',
            workoutNotes: 'Squat triple at 160 kg moved fast. Knee felt stable with sleeve.',
            status: 'new',
          },
        ],
      },
    }),
    seedClient('c-meera', {
      name: 'Meera Iyer', age: '30', height: '165', heightUnit: 'cm', weight: '58', weightUnit: 'kg',
      gender: 'women', lifestyle: 'active', injuries: '',
      goal: 'muscle', equipment: 'gym', experience: 'intermediate', daysPerWeek: 7,
    }, { joined: '2026-08-14', lastActive: 'Today' }),
  ]

  return {
    trainer: { id: 't-vikram', role: 'trainer', name: 'Coach Vikram', title: 'Head Trainer, X Fit Formula' },
    clients,
  }
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupt -> reseed */ }
  const db = seed()
  saveDB(db)
  return db
}

export function saveDB(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // Quota exceeded — drop oldest photo attachments first, keep the text data
    try {
      const slim = {
        ...db,
        clients: db.clients.map((c) => {
          const cis = c.checkIns || []
          let dropped = 0
          return {
            ...c,
            checkIns: cis.map((ci, i) => {
              // keep photos on the 3 most recent check-ins only
              if (i < cis.length - 3 && ci.attachments?.length) {
                dropped += ci.attachments.length
                return { ...ci, attachments: [], attachmentsDropped: true }
              }
              return ci
            }),
          }
        }),
      }
      localStorage.setItem(KEY, JSON.stringify(slim))
    } catch { /* give up silently — state still lives in memory this session */ }
  }
}

export function resetDB() {
  localStorage.removeItem(KEY)
  return loadDB()
}

export function nowStamp() {
  return new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function slugId(name) {
  return 'c-' + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)
}
