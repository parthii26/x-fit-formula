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
    c.planMeta = { rx: gen.rx, volumeNote: gen.volumeNote, split: gen.split, assignedBy: 'Head Coach' }
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
            notes: 'Felt strong on bench press. Energy consistent through the afternoon.',
            status: 'new',
          },
        ],
        messages: [
          { id: 'm-1', from: 'client', text: 'Hey coach, finished week 1. Feeling good, shoulder feels fine.', time: '2 days ago' },
          { id: 'm-2', from: 'trainer', text: 'Great work Ananya. Keep that water intake up. Increasing dumbbell bench weight next week.', time: 'Yesterday' },
        ],
      },
    }),
    seedClient('c-rohit', {
      name: 'Rohit Sharma', age: '34', height: '178', heightUnit: 'cm', weight: '84', weightUnit: 'kg',
      gender: 'men', lifestyle: 'active', injuries: 'Right knee stiffness on deep squats',
      goal: 'recomp', equipment: 'gym', experience: 'advanced', daysPerWeek: 5,
    }, {
      autoPlan: true, joined: '2026-06-01', lastActive: 'Today',
      overrides: {
        completed: { Monday: true, Tuesday: true, Wednesday: true },
        weightLog: [
          { date: 'Jul 20', value: 85.8 }, { date: 'Jul 27', value: 85.1 },
          { date: 'Aug 3', value: 84.7 }, { date: 'Aug 10', value: 84.3 }, { date: 'Aug 17', value: 84.0 },
        ],
        checkIns: [
          {
            id: 'ci-2', date: isoDate(-1), session: 'Heavy lower body day', energy: 'medium',
            meals: 'Breakfast: eggs + sourdough. Lunch: chicken biryani (homemade, tracked). Dinner: fish curry + rice.',
            protein: '160', calories: '2200', water: '3.5', sleep: '6.5', weight: '84.0',
            notes: 'Knee felt okay with knee sleeves. Did 4 sets on leg press.',
            status: 'new',
          },
        ],
        messages: [
          { id: 'm-3', from: 'client', text: 'Morning coach, checked in. Sleep was a bit low last night.', time: '1 day ago' },
        ],
      },
    }),
    seedClient('c-kavya', {
      name: 'Kavya Nair', age: '23', height: '158', heightUnit: 'cm', weight: '52', weightUnit: 'kg',
      gender: 'women', lifestyle: 'sedentary', injuries: '',
      goal: 'muscle', equipment: 'home', experience: 'beginner', daysPerWeek: 3,
    }, {
      autoPlan: true, joined: '2026-07-20', lastActive: 'Yesterday',
      overrides: {
        completed: { Monday: true },
        weightLog: [{ date: 'Aug 3', value: 51.5 }, { date: 'Aug 10', value: 51.8 }, { date: 'Aug 17', value: 52.0 }],
        checkIns: [],
        messages: [
          { id: 'm-4', from: 'client', text: 'First time working out properly. Loving the home routine so far!', time: '3 days ago' },
          { id: 'm-5', from: 'trainer', text: 'Welcome Kavya! Consistency is key. Take your time on the tempo cues.', time: '2 days ago' },
        ],
      },
    }),
    seedClient('c-dev', {
      name: 'Dev Patel', age: '41', height: '172', heightUnit: 'cm', weight: '91', weightUnit: 'kg',
      gender: 'men', lifestyle: 'desk', injuries: 'Chronic shoulder impingement (left side)',
      goal: 'fatloss', equipment: 'gym', experience: 'beginner', daysPerWeek: 3,
    }, {
      autoPlan: false, joined: '2026-08-10', lastActive: 'Today',
      overrides: {
        planStatus: 'pending',
        completed: {},
        weightLog: [{ date: 'Aug 10', value: 91.8 }, { date: 'Aug 17', value: 91.0 }],
        checkIns: [
          {
            id: 'ci-3', date: isoDate(0), session: 'Cardio + Mobility', energy: 'high',
            meals: 'Diet tracked strictly: 1800 kcal, 130g protein. No sugar.',
            protein: '130', calories: '1800', water: '4', sleep: '8', weight: '91.0',
            notes: 'Awaiting updated workout plan for shoulder rehab.',
            status: 'new',
          },
        ],
        messages: [
          { id: 'm-6', from: 'client', text: 'Hi coach, submitted my intake form and check-in. Looking forward to the program.', time: 'Today' },
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
    trainer: { id: 't-admin', role: 'trainer', name: 'Coach', title: 'Head Trainer, X Fit Formula' },
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
