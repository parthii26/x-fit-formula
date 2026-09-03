// ─── Mock backend: localStorage-backed store with seeded demo data ─────────
import { generatePlan } from './planGenerator.js'

const KEY = 'xff-db-prod-v1'

export function isoDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function dateLabel(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function seed() {
  return {
    trainer: { id: 't-admin', role: 'trainer', name: 'Coach', title: 'Head Trainer, X Fit Formula' },
    clients: [],
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
