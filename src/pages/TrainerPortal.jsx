import { useEffect, useRef, useState } from 'react'
import {
  LayoutGrid, Users, MessageSquare, ArrowRight, ArrowLeft, Search,
  Plus, Trash2, GripVertical, Send, ChevronUp, ChevronDown, Wand2, Dumbbell, Play,
} from 'lucide-react'
import Shell from '../components/Shell.jsx'
import { Card, Badge, Avatar, Label, TextInput, TextArea, Btn, Divider, SectionTitle } from '../components/ui.jsx'
import { AttachmentStrip } from '../components/Attachments.jsx'
import { LABELS, generatePlan, assembleWeek } from '../lib/planGenerator.js'
import { nowStamp, dateLabel } from '../lib/store.js'
import { fetchExerciseById, fetchHomeWorkoutVideoById, createWorkout, isSupabaseConfigured } from '../lib/supabase.js'
import ExerciseLibrary from './ExerciseLibrary.jsx'
import ExerciseDetailModal from '../components/ExerciseDetailModal.jsx'

const newCheckIns = (c) => (c.checkIns || []).filter((ci) => ci.status === 'new')

const NAV = [
  { id: 'dash', label: 'Overview', icon: LayoutGrid },
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'library', label: 'Workout Library', icon: Dumbbell },
  { id: 'inbox', label: 'Inbox', icon: MessageSquare },
]

export default function TrainerPortal({ trainer, clients, onUpdateClient, onLogout }) {
  const [tab, setTab] = useState('dash')
  const [selectedId, setSelectedId] = useState(null)
  const [builderId, setBuilderId] = useState(null)
  const [previewExercise, setPreviewExercise] = useState(null)

  const pendingCount = clients.filter((c) => c.planStatus !== 'assigned').length
  const reportCount = clients.reduce((sum, c) => sum + newCheckIns(c).length, 0)
  const nav = NAV.map((n) => (n.id === 'roster' ? { ...n, badge: (pendingCount + reportCount) || null } : n))

  const selected = clients.find((c) => c.id === selectedId)
  const building = clients.find((c) => c.id === builderId)

  const openClient = (id) => { setSelectedId(id); setBuilderId(null); setTab('roster') }
  const shellUser = { name: trainer.name, subtitle: trainer.title }

  const openPreview = async (name) => {
    if (!name) return
    const hwFound = await fetchHomeWorkoutVideoById(name)
    if (hwFound) {
      setPreviewExercise(hwFound)
      return
    }
    const found = await fetchExerciseById(name)
    if (found) {
      setPreviewExercise(found)
    } else {
      setPreviewExercise({
        name,
        target: 'Target Muscle',
        difficulty: 'Beginner',
        category: 'Home',
        equipment: 'Bodyweight',
        instructions: ['Execute with steady tempo, strict spinal alignment, and controlled eccentric descent.'],
        form_cues: ['Keep core braced throughout movement.'],
        common_mistakes: ['Rushing repetition tempo.'],
        breathing: 'Inhale during lowering phase; exhale during concentric exertion.',
        source_name: 'X FIT FORMULA Protocol',
        metadata_license: 'MIT',
        isHomeWorkout: true,
      })
    }
  }

  return (
    <Shell user={shellUser} roleLabel="Trainer" nav={nav} active={tab}
      onNav={(t) => { setTab(t); setSelectedId(null); setBuilderId(null) }} onLogout={onLogout}>
      {tab === 'dash' && <Overview trainer={trainer} clients={clients} pendingCount={pendingCount} onOpenClient={openClient} />}
      {tab === 'roster' && !selected && !building && <Roster clients={clients} onOpen={openClient} />}
      {tab === 'roster' && selected && !building && (
        <ClientDetail client={selected} onBack={() => setSelectedId(null)} onBuild={() => setBuilderId(selected.id)} onUpdate={onUpdateClient} />
      )}
      {tab === 'roster' && building && (
        <WorkoutBuilder client={building} trainerName={trainer.name}
          onCancel={() => setBuilderId(null)}
          onSave={(updated) => { onUpdateClient(updated); setBuilderId(null) }}
          onPreview={openPreview} />
      )}
      {tab === 'library' && <ExerciseLibrary embedded={true} />}
      {tab === 'inbox' && <Inbox clients={clients} onUpdateClient={onUpdateClient} />}

      {previewExercise && (
        <ExerciseDetailModal
          exercise={previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}
    </Shell>
  )
}

// ─── Overview / command center ──────────────────────────────────────────────

function Overview({ trainer, clients, pendingCount, onOpenClient }) {
  const withInjuries = clients.filter((c) => c.profile.injuries?.trim()).length
  const pending = clients.filter((c) => c.planStatus !== 'assigned')
  const unreadThreads = clients.filter((c) => c.messages.at(-1)?.from === 'client')
  const reportClients = clients.filter((c) => newCheckIns(c).length > 0)
  const reportCount = reportClients.reduce((sum, c) => sum + newCheckIns(c).length, 0)

  return (
    <div className="animate-fade-up">
      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gold">Command Center</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[1.02] tracking-[0.08em] sm:text-5xl">
        {trainer.name.split(' ').at(-1)}
      </h1>

      {/* Stat strip */}
      <div className="mt-12 grid grid-cols-2 gap-px border border-white/10 bg-white/10 lg:grid-cols-4">
        {[
          ['Active Clients', clients.length, false],
          ['Pending Plans', pendingCount, pendingCount > 0],
          ['New Reports', reportCount, reportCount > 0],
          ['Injury Flags', withInjuries, withInjuries > 0],
        ].map(([label, value, hot]) => (
          <div key={label} className="bg-surface p-6 sm:p-8">
            <p className={`font-display text-4xl font-extrabold leading-none sm:text-5xl ${hot ? 'text-gold' : 'text-ink'}`}>
              {String(value).padStart(2, '0')}
            </p>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">{label}</p>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="mt-14">
        <SectionTitle kicker="Action Required">Queue</SectionTitle>
        <div className="mt-6 border-t border-white/10">
          {pending.length === 0 && unreadThreads.length === 0 && reportClients.length === 0 && (
            <p className="border-b border-white/10 py-8 text-[10px] uppercase tracking-[0.3em] text-white/25">
              Queue clear — all clients programmed
            </p>
          )}
          {pending.map((c) => (
            <QueueRow key={c.id} client={c} tag="Program Pending" tagTone="amber"
              sub={`${c.profile.daysPerWeek} D/WK — ${LABELS.goal[c.profile.goal]} — ${LABELS.equipment[c.profile.equipment]}`}
              onClick={() => onOpenClient(c.id)} />
          ))}
          {reportClients.map((c) => {
            const latest = newCheckIns(c).at(-1)
            return (
              <QueueRow key={`r-${c.id}`} client={c} tag={`${newCheckIns(c).length} New Report${newCheckIns(c).length > 1 ? 's' : ''}`} tagTone="gold"
                sub={`${dateLabel(latest.date)} — ${latest.session}${latest.workoutNotes ? ` — ${latest.workoutNotes}` : ''}`}
                onClick={() => onOpenClient(c.id)} />
            )
          })}
          {unreadThreads.map((c) => (
            <QueueRow key={`m-${c.id}`} client={c} tag="Reply Due" tagTone="mute"
              sub={c.messages.at(-1).text} onClick={() => onOpenClient(c.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function QueueRow({ client, tag, tagTone, sub, onClick }) {
  return (
    <button onClick={onClick}
      className="group flex min-h-[76px] w-full items-center gap-5 border-b border-white/10 py-4 text-left transition-colors hover:bg-surface sm:px-4">
      <Avatar name={client.profile.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold uppercase tracking-[0.15em]">{client.profile.name}</p>
        <p className="mt-1 truncate text-xs text-mute">{sub}</p>
      </div>
      <Badge tone={tagTone} className="hidden sm:inline-flex">{tag}</Badge>
      <ArrowRight className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-1 group-hover:text-gold" strokeWidth={1.5} />
    </button>
  )
}

// ─── Roster ─────────────────────────────────────────────────────────────────

function Roster({ clients, onOpen }) {
  const [q, setQ] = useState('')
  const filtered = clients.filter((c) => c.profile.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle kicker={`${clients.length} Active`}>Client Roster</SectionTitle>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" strokeWidth={1.5} />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search"
            className="min-h-[48px] w-full rounded-none border-0 border-b border-white/15 bg-transparent pl-8 text-[15px] text-ink placeholder-white/25 outline-none transition-colors focus:border-gold"
          />
        </div>
      </div>

      {/* Mobile: minimalist cards */}
      <div className="mt-8 space-y-px border border-white/10 bg-white/10 md:hidden">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => onOpen(c.id)} className="block w-full bg-surface p-6 text-left transition-colors active:bg-surface-2">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-base font-bold uppercase tracking-[0.15em]">{c.profile.name}</p>
              <ArrowRight className="h-4 w-4 shrink-0 text-mute" strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-mute">
              {LABELS.experience[c.profile.experience]} — {c.profile.daysPerWeek} D/WK — {LABELS.goal[c.profile.goal]}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="mute">{LABELS.equipment[c.profile.equipment]}</Badge>
              {c.planStatus === 'assigned' ? <Badge tone="gold">Active</Badge> : <Badge tone="amber">Pending</Badge>}
              {c.profile.injuries?.trim() && <Badge tone="red">Injury Noted</Badge>}
              {newCheckIns(c).length > 0 && <Badge tone="gold">{newCheckIns(c).length} Report{newCheckIns(c).length > 1 ? 's' : ''}</Badge>}
            </div>
          </button>
        ))}
      </div>

      {/* Desktop: data table */}
      <div className="mt-8 hidden border border-white/10 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">
              <th className="px-6 py-5 font-semibold">Client</th>
              <th className="px-4 py-5 font-semibold">Goal</th>
              <th className="px-4 py-5 font-semibold">Equipment</th>
              <th className="px-4 py-5 font-semibold">Level / Freq</th>
              <th className="px-4 py-5 font-semibold">Flags</th>
              <th className="px-4 py-5 font-semibold">Status</th>
              <th className="px-4 py-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((c) => (
              <tr key={c.id} onClick={() => onOpen(c.id)} className="group cursor-pointer transition-colors hover:bg-surface">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar name={c.profile.name} size="sm" />
                    <div>
                      <p className="font-display text-[13px] font-bold uppercase tracking-[0.12em]">{c.profile.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-mute">Active {c.lastActive}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 text-[13px] text-ink/80">{LABELS.goal[c.profile.goal]}</td>
                <td className="px-4 py-5 text-[13px] text-ink/80">{LABELS.equipment[c.profile.equipment]}</td>
                <td className="px-4 py-5 text-[13px] text-ink/80">{LABELS.experience[c.profile.experience]} — {c.profile.daysPerWeek}D</td>
                <td className="px-4 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {c.profile.injuries?.trim() && <Badge tone="red">Injury</Badge>}
                    {newCheckIns(c).length > 0 && <Badge tone="gold">{newCheckIns(c).length} Rpt</Badge>}
                    {!c.profile.injuries?.trim() && newCheckIns(c).length === 0 && <span className="text-white/20">—</span>}
                  </div>
                </td>
                <td className="px-4 py-5">
                  {c.planStatus === 'assigned' ? <Badge tone="gold">Active</Badge> : <Badge tone="amber">Pending</Badge>}
                </td>
                <td className="px-4 py-5 text-right">
                  <ArrowRight className="ml-auto h-4 w-4 text-mute transition-transform group-hover:translate-x-1 group-hover:text-gold" strokeWidth={1.5} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clients.length === 0 ? (
        <div className="mt-8 border border-white/10 bg-surface/40 p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-gold/50 mb-3" strokeWidth={1.5} />
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink">No Registered Athletes Yet</p>
          <p className="mt-2 text-xs text-mute max-w-sm mx-auto">
            Your roster is ready for production. When clients sign up and complete onboarding, their profile will appear here automatically.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 border border-white/10 p-10 text-center text-[10px] uppercase tracking-[0.3em] text-white/25">
          No records match search
        </p>
      ) : null}
    </div>
  )
}

// ─── Client detail ──────────────────────────────────────────────────────────

function ClientDetail({ client, onBack, onBuild, onUpdate }) {
  const p = client.profile
  const hasInjury = !!p.injuries?.trim()
  const [reply, setReply] = useState('')
  const newReports = newCheckIns(client)

  const reviewCheckIn = (id, note) => {
    onUpdate({
      ...client,
      checkIns: (client.checkIns || []).map((ci) =>
        ci.id === id ? { ...ci, status: 'reviewed', trainerNote: note?.trim() || ci.trainerNote } : ci
      ),
    })
  }

  const sendReply = (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    onUpdate({ ...client, messages: [...client.messages, { from: 'trainer', text: reply.trim(), ts: nowStamp() }] })
    setReply('')
  }

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="flex min-h-[44px] items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-mute transition-colors hover:text-gold">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Roster
      </button>

      {/* Header */}
      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {client.planStatus === 'assigned' ? <Badge tone="gold">Program Active</Badge> : <Badge tone="amber">Program Pending</Badge>}
            <Badge tone="mute">{LABELS.experience[p.experience]}</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold uppercase leading-tight tracking-[0.08em] sm:text-5xl">
            {p.name}
          </h1>
          <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-mute">
            Joined {p && client.joined} — Last active {client.lastActive}
          </p>
        </div>
        <Btn variant="gold" onClick={onBuild} className="shrink-0">
          {client.planStatus === 'assigned' ? 'Revise Program' : 'Build Program'}
        </Btn>
      </div>

      {/* Injuries — elegant amber outline, immediately visible */}
      <div className={`mt-10 border p-6 sm:p-8 ${hasInjury ? 'border-amber-400/50' : 'border-white/10'}`}>
        <div className="flex items-center justify-between">
          <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${hasInjury ? 'text-amber-400/90' : 'text-mute'}`}>
            Injuries / Limitations
          </p>
          {hasInjury && <Badge tone="amber">Program Around This</Badge>}
        </div>
        <p className={`mt-4 text-sm leading-relaxed ${hasInjury ? 'text-amber-100/90' : 'text-white/30'}`}>
          {hasInjury ? p.injuries.trim() : 'None reported.'}
        </p>
      </div>

      {/* Daily reports — diet + workout progress from the client */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle kicker="Client Uploads">Daily Reports</SectionTitle>
          {newReports.length > 0 && <Badge tone="gold">{newReports.length} Unreviewed</Badge>}
        </div>
        <ReportsSection client={client} onReview={reviewCheckIn} />
      </div>

      {/* Intake data grid */}
      <div className="mt-10">
        <SectionTitle kicker="Intake">Client Data</SectionTitle>
        <div className="mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
          {[
            ['Age', p.age],
            ['Gender', p.gender === 'men' ? 'Male' : 'Female'],
            ['Height', `${p.height} ${p.heightUnit}`],
            ['Weight', `${p.weight} ${p.weightUnit}`],
            ['Lifestyle', LABELS.lifestyle[p.lifestyle]],
            ['Goal', LABELS.goal[p.goal]],
            ['Equipment', LABELS.equipment[p.equipment], true],
            ['Frequency', `${p.daysPerWeek} Days / Week`, true],
          ].map(([k, v, gold]) => (
            <div key={k} className="bg-surface p-5 sm:p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">{k}</p>
              <p className={`mt-2 font-display text-sm font-bold uppercase tracking-[0.1em] ${gold ? 'text-gold' : 'text-ink'}`}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Current program snapshot */}
      {client.planStatus === 'assigned' && client.plan && (
        <div className="mt-10">
          <SectionTitle kicker="Current Week">Program</SectionTitle>
          <div className="mt-6 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {client.plan.filter((d) => !d.rest).map((d, i) => (
              <div key={d.day} className="bg-surface p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">Day {String(i + 1).padStart(2, '0')} — {d.day.slice(0, 3)}</p>
                  {client.completed[d.day] && <Badge tone="gold">Done</Badge>}
                </div>
                <p className="mt-2 font-display text-sm font-bold uppercase tracking-[0.12em]">{d.focus}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-mute">{d.exercises.length} movements</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correspondence */}
      <div className="mt-10">
        <SectionTitle kicker="Direct Line">Correspondence</SectionTitle>
        <div className="mt-6 max-h-72 space-y-4 overflow-y-auto border border-white/10 bg-surface p-5 sm:p-6">
          {client.messages.length === 0 && (
            <p className="py-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/25">No correspondence on record</p>
          )}
          {client.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'trainer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 sm:max-w-[70%] ${m.from === 'trainer' ? 'bg-ink text-obsidian' : 'border border-white/10 bg-obsidian text-ink'}`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${m.from === 'trainer' ? 'text-obsidian/50' : 'text-mute'}`}>{m.ts}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendReply} className="mt-3 flex items-center gap-3">
          <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply"
            className="min-h-[52px] flex-1 rounded-none border border-white/10 bg-surface px-5 text-[15px] text-ink placeholder-white/25 outline-none transition-colors focus:border-gold/60" />
          <button type="submit" disabled={!reply.trim()}
            className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center transition-colors ${reply.trim() ? 'bg-gold text-obsidian hover:bg-ink' : 'bg-surface-2 text-white/25'}`}>
            <Send className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Daily reports (check-in review) ────────────────────────────────────────

function ReportsSection({ client, onReview }) {
  const reports = [...(client.checkIns || [])].sort((a, b) => b.date.localeCompare(a.date))
  const [openId, setOpenId] = useState(() => reports.find((r) => r.status === 'new')?.id || null)

  if (reports.length === 0) {
    return (
      <p className="mt-6 border-l border-white/15 pl-5 text-sm text-mute">
        No reports filed. The client has not submitted a daily check-in yet.
      </p>
    )
  }

  return (
    <div className="mt-6 border-t border-white/10">
      {reports.map((ci) => (
        <ReportRow
          key={ci.id}
          ci={ci}
          unit={client.profile.weightUnit}
          open={openId === ci.id}
          onToggle={() => setOpenId(openId === ci.id ? null : ci.id)}
          onReview={onReview}
        />
      ))}
    </div>
  )
}

function ReportRow({ ci, unit, open, onToggle, onReview }) {
  const [note, setNote] = useState('')
  const isNew = ci.status === 'new'

  return (
    <div className="border-b border-white/10">
      <button onClick={onToggle} className="flex min-h-[64px] w-full items-center gap-4 py-4 text-left transition-colors hover:bg-surface sm:px-4">
        <span className={`h-1.5 w-1.5 shrink-0 ${isNew ? 'bg-gold' : 'bg-white/15'}`} />
        <p className="w-20 shrink-0 font-display text-xs font-bold uppercase tracking-[0.2em]">{dateLabel(ci.date)}</p>
        <p className="min-w-0 flex-1 truncate text-xs text-mute">{ci.session}{ci.workoutNotes ? ` — ${ci.workoutNotes}` : ''}</p>
        {ci.attachments?.length > 0 && (
          <Badge tone="mute" className="hidden shrink-0 sm:inline-flex">{ci.attachments.length} Photo{ci.attachments.length > 1 ? 's' : ''}</Badge>
        )}
        {isNew ? <Badge tone="gold" className="hidden sm:inline-flex">New</Badge> : <Badge tone="mute" className="hidden sm:inline-flex">Reviewed</Badge>}
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-mute" strokeWidth={1.5} /> : <ChevronDown className="h-4 w-4 shrink-0 text-mute" strokeWidth={1.5} />}
      </button>

      {open && (
        <div className="pb-8 sm:px-4">
          {/* Metrics strip */}
          <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/10 sm:grid-cols-6">
            {[
              ['Energy', ci.energy],
              ['Protein', ci.protein ? `${ci.protein} g` : '—'],
              ['Calories', ci.calories || '—'],
              ['Water', ci.water ? `${ci.water} L` : '—'],
              ['Sleep', ci.sleep ? `${ci.sleep} h` : '—'],
              ['Weight', ci.weight ? `${ci.weight} ${unit}` : '—'],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface p-3 sm:p-4">
                <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-mute">{k}</p>
                <p className="mt-1 text-xs font-bold capitalize text-ink sm:text-sm">{v}</p>
              </div>
            ))}
          </div>

          {ci.workoutNotes && (
            <div className="mt-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">Workout Notes</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/90">{ci.workoutNotes}</p>
            </div>
          )}

          {ci.meals && (
            <div className="mt-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">Diet Log</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{ci.meals}</p>
            </div>
          )}

          {ci.attachments?.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">Photo Evidence</p>
              <AttachmentStrip attachments={ci.attachments} />
            </div>
          )}

          {ci.trainerNote && !isNew && (
            <div className="mt-5 border-l border-gold/60 pl-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold">Your Response</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/90">{ci.trainerNote}</p>
            </div>
          )}

          {isNew && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <Label hint="Sent to the client with the review">Coaching Response</Label>
              <TextArea
                rows={2}
                placeholder="Adjustment, correction, or acknowledgment based on this data."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="mt-4 flex gap-3">
                <Btn variant="gold" onClick={() => onReview(ci.id, note)} className="flex-1 sm:flex-none">
                  Mark Reviewed{note.trim() ? ' + Send Note' : ''}
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Workout Builder ────────────────────────────────────────────────────────

const FOCUS_PRESETS = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Conditioning', 'Active Recovery']

const emptyExercise = () => ({ name: '', sets: '3', reps: '8-12' })

function buildInitialDays(client) {
  const n = client.profile.daysPerWeek
  if (client.plan && client.planStatus === 'assigned') {
    const existing = client.plan.filter((d) => !d.rest).map((d) => ({
      focus: d.focus,
      exercises: d.exercises.map((ex) => ({ ...ex })),
    }))
    while (existing.length < n) existing.push({ focus: '', exercises: [emptyExercise()] })
    return existing.slice(0, n)
  }
  return Array.from({ length: n }, () => ({ focus: '', exercises: [emptyExercise()] }))
}

function WorkoutBuilder({ client, trainerName, onCancel, onSave, onPreview }) {
  const p = client.profile
  const [days, setDays] = useState(() => buildInitialDays(client))
  const [activeDay, setActiveDay] = useState(0)
  const [dragIdx, setDragIdx] = useState(null)
  const hasInjury = !!p.injuries?.trim()

  const setDay = (i, patch) => setDays((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)))
  const updateExercise = (di, ei, patch) =>
    setDays((ds) => ds.map((d, j) => j !== di ? d : { ...d, exercises: d.exercises.map((ex, k) => (k === ei ? { ...ex, ...patch } : ex)) }))
  const addExercise = (di, name = '') => setDay(di, { exercises: [...days[di].exercises, { ...emptyExercise(), name }] })
  const removeExercise = (di, ei) => setDay(di, { exercises: days[di].exercises.filter((_, k) => k !== ei) })

  const moveExercise = (di, from, to) => {
    if (to < 0 || to >= days[di].exercises.length) return
    setDays((ds) => ds.map((d, j) => {
      if (j !== di) return d
      const arr = [...d.exercises]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return { ...d, exercises: arr }
    }))
  }

  const onDragStart = (ei) => setDragIdx(ei)
  const onDragOver = (e, ei) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === ei) return
    moveExercise(activeDay, dragIdx, ei)
    setDragIdx(ei)
  }

  const autofill = () => {
    const gen = generatePlan(p)
    setDays(gen.week.filter((d) => !d.rest).map((d) => ({
      focus: d.focus,
      exercises: d.exercises.map((ex) => ({ name: ex.name, sets: String(ex.sets), reps: String(ex.reps) })),
    })))
  }

  const dayValid = (d) => d.focus.trim() && d.exercises.some((ex) => ex.name.trim())
  const allValid = days.every(dayValid)

  const save = async () => {
    const week = assembleWeek(days, p.daysPerWeek)
    const gen = generatePlan(p)

    // Asynchronously persist to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        for (const [dayIdx, day] of days.entries()) {
          if (!dayValid(day)) continue
          const slug = `workout-${client.id}-d${dayIdx + 1}-${Date.now()}`
          await createWorkout({
            name: `${p.name} — Day ${dayIdx + 1} (${day.focus})`,
            slug,
            description: `Assigned by ${trainerName}`,
            goal: p.goal,
            difficulty: p.experience === 'beginner' ? 'Beginner' : p.experience === 'intermediate' ? 'Intermediate' : 'Advanced',
            category: p.equipment === 'bodyweight' ? 'Home' : 'Gym',
            equipment: p.equipment,
            active: true,
          }, day.exercises)
        }
      } catch (err) {
        console.warn('[Supabase] Workout persistence warning:', err?.message || err)
      }
    }

    onSave({
      ...client,
      plan: week,
      planStatus: 'assigned',
      planMeta: { rx: gen.rx, volumeNote: gen.volumeNote, split: days.map((d) => d.focus).join(' / '), assignedBy: trainerName },
      completed: {},
      exerciseDone: {},
    })
  }

  const d = days[activeDay]

  const POPULAR_EXERCISES = [
    'Incline Push-Ups', 'Push-Ups', 'Free Squats', 'Standard Crunches', 'Crunches',
    'Reverse Crunches', 'Leg Raises', 'Hanging Knee Raises', 'Bicycle Crunches',
    'Mountain Climbers', 'Plank', 'Walking', 'Warm-up',
    'Barbell Bench Press', 'Lat Pulldown', 'Leg Press', 'Seated Cable Row'
  ]

  return (
    <div className="animate-fade-up">
      <button onClick={onCancel} className="flex min-h-[44px] items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-mute transition-colors hover:text-gold">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> {p.name.split(' ')[0]}
      </button>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gold">Program Builder</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-[0.08em] sm:text-4xl">{p.name}</h1>
          <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-mute">
            {p.daysPerWeek} Days — {LABELS.experience[p.experience]} — {LABELS.goal[p.goal]} — {LABELS.equipment[p.equipment]}
          </p>
        </div>
        <Btn variant="ghost" onClick={autofill} className="flex shrink-0 items-center gap-3">
          <Wand2 className="h-4 w-4" strokeWidth={1.5} /> Auto-Fill Formula
        </Btn>
      </div>

      {/* Constraints */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone="mute">{LABELS.equipment[p.equipment]} Only</Badge>
        <Badge tone="mute">{p.daysPerWeek} Training Days Required</Badge>
        {hasInjury && <Badge tone="amber">{p.injuries.trim().slice(0, 48)}{p.injuries.trim().length > 48 ? '…' : ''}</Badge>}
      </div>

      {/* Day tabs */}
      <div className="mt-10 flex gap-px overflow-x-auto border border-white/10 bg-white/10">
        {days.map((day, i) => (
          <button key={i} onClick={() => setActiveDay(i)}
            className={`flex min-h-[64px] min-w-[100px] flex-1 flex-col items-center justify-center px-3 transition-colors
              ${activeDay === i ? 'bg-ink text-obsidian' : dayValid(day) ? 'bg-surface text-ink' : 'bg-surface text-white/30'}`}>
            <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${activeDay === i ? 'text-obsidian/50' : 'text-mute'}`}>
              Day {String(i + 1).padStart(2, '0')}
            </span>
            <span className="mt-1 max-w-[90px] truncate font-display text-xs font-bold uppercase tracking-[0.1em]">
              {day.focus || '—'}
            </span>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="mt-10">
        <Label>Day {String(activeDay + 1).padStart(2, '0')} — Focus</Label>
        <div className="flex flex-wrap gap-2">
          {FOCUS_PRESETS.map((f) => (
            <button key={f} type="button" onClick={() => setDay(activeDay, { focus: f })}
              className={`min-h-[44px] border px-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors
                ${d.focus === f ? 'border-gold bg-gold text-obsidian' : 'border-white/15 text-mute hover:border-white/40 hover:text-ink'}`}>
              {f}
            </button>
          ))}
        </div>
        <TextInput className="mt-4" type="text" placeholder="Custom focus"
          value={d.focus} onChange={(e) => setDay(activeDay, { focus: e.target.value })} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <Label hint="Drag to reorder — arrows on mobile">Movements</Label>
        </div>

        {/* Quick Exercise Tags */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 border border-white/5 bg-surface/50 p-2.5">
          <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.2em] text-gold">
            Quick Add:
          </span>
          {POPULAR_EXERCISES.slice(0, 6).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                const emptyIdx = d.exercises.findIndex((e) => !e.name.trim())
                if (emptyIdx !== -1) {
                  updateExercise(activeDay, emptyIdx, { name })
                } else {
                  addExercise(activeDay, name)
                }
              }}
              className="border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-mute hover:border-gold hover:text-gold transition-colors"
            >
              + {name}
            </button>
          ))}
        </div>

        <div className="space-y-px border border-white/10 bg-white/10">
          {d.exercises.map((ex, ei) => (
            <div key={ei} draggable onDragStart={() => onDragStart(ei)} onDragOver={(e) => onDragOver(e, ei)} onDragEnd={() => setDragIdx(null)}
              className={`bg-surface p-4 transition-colors sm:p-5 ${dragIdx === ei ? 'bg-surface-2' : ''}`}>
              <div className="flex items-center gap-3">
                <GripVertical className="hidden h-4 w-4 shrink-0 cursor-grab text-white/20 sm:block" strokeWidth={1.5} />
                <span className="w-7 shrink-0 font-display text-xs font-bold text-white/25">{String(ei + 1).padStart(2, '0')}</span>
                <input
                  value={ex.name}
                  onChange={(e) => updateExercise(activeDay, ei, { name: e.target.value })}
                  placeholder="Movement (e.g. Barbell Bench Press)"
                  className="min-h-[44px] w-full min-w-0 flex-1 rounded-none border-0 border-b border-white/10 bg-transparent text-sm text-ink placeholder-white/25 outline-none transition-colors focus:border-gold"
                />
                {ex.name.trim() && (
                  <button
                    type="button"
                    onClick={() => onPreview && onPreview(ex.name)}
                    className="flex h-8 shrink-0 items-center gap-1 border border-white/10 bg-surface-2 px-2 text-[9px] font-bold uppercase tracking-wider text-gold hover:border-gold transition-colors"
                    title="Preview Demo Video & Protocol"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" /> Demo
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3 sm:pl-14">
                <div className="flex flex-1 items-center gap-3">
                  <input value={ex.sets} onChange={(e) => updateExercise(activeDay, ei, { sets: e.target.value })} placeholder="Sets"
                    className="min-h-[44px] w-full rounded-none border-0 border-b border-white/10 bg-transparent text-center text-sm text-ink outline-none transition-colors focus:border-gold" />
                  <span className="text-[10px] text-white/25">×</span>
                  <input value={ex.reps} onChange={(e) => updateExercise(activeDay, ei, { reps: e.target.value })} placeholder="Reps"
                    className="min-h-[44px] w-full rounded-none border-0 border-b border-white/10 bg-transparent text-center text-sm text-ink outline-none transition-colors focus:border-gold" />
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconBtn onClick={() => moveExercise(activeDay, ei, ei - 1)} disabled={ei === 0}><ChevronUp className="h-4 w-4" strokeWidth={1.5} /></IconBtn>
                  <IconBtn onClick={() => moveExercise(activeDay, ei, ei + 1)} disabled={ei === d.exercises.length - 1}><ChevronDown className="h-4 w-4" strokeWidth={1.5} /></IconBtn>
                  <IconBtn danger onClick={() => removeExercise(activeDay, ei)} disabled={d.exercises.length === 1}><Trash2 className="h-4 w-4" strokeWidth={1.5} /></IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => addExercise(activeDay)}
          className="mt-px flex min-h-[52px] w-full items-center justify-center gap-3 border border-dashed border-white/15 text-[10px] font-bold uppercase tracking-[0.3em] text-mute transition-colors hover:border-gold hover:text-gold">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Add Movement
        </button>
      </div>

      {/* Save bar */}
      <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-mute">
          {days.filter(dayValid).length} / {days.length} days complete
          {!allValid && ' — each day requires a focus and one movement'}
        </p>
        <div className="flex gap-3">
          <Btn variant="ghost" onClick={onCancel} className="flex-1 sm:flex-none">Discard</Btn>
          <Btn variant="gold" onClick={save} disabled={!allValid} className="flex-1 sm:flex-none">
            Assign Program
          </Btn>
        </div>
      </div>
    </div>
  )
}

function IconBtn({ children, onClick, disabled, danger }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex h-11 w-11 items-center justify-center border transition-colors
        ${disabled ? 'cursor-not-allowed border-white/5 text-white/15'
          : danger ? 'border-white/10 text-mute hover:border-red-400/50 hover:text-red-300'
            : 'border-white/10 text-mute hover:border-gold hover:text-gold'}`}>
      {children}
    </button>
  )
}

// ─── Inbox ──────────────────────────────────────────────────────────────────

function Inbox({ clients, onUpdateClient }) {
  const withMessages = clients.filter((c) => c.messages.length > 0)
  const [openId, setOpenId] = useState(withMessages[0]?.id || null)
  const open = clients.find((c) => c.id === openId)
  const [text, setText] = useState('')
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [openId, open?.messages.length])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim() || !open) return
    onUpdateClient({ ...open, messages: [...open.messages, { from: 'trainer', text: text.trim(), ts: nowStamp() }] })
    setText('')
  }

  return (
    <div className="animate-fade-up grid grid-cols-1 gap-8 lg:h-[calc(100vh-180px)] lg:grid-cols-[320px_1fr]">
      <div className="lg:overflow-y-auto">
        <SectionTitle kicker="Correspondence">Inbox</SectionTitle>
        {withMessages.length === 0 && (
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/25">No threads</p>
        )}
        <div className="mt-6 border-t border-white/10">
          {withMessages.map((c) => {
            const last = c.messages.at(-1)
            return (
              <button key={c.id} onClick={() => setOpenId(c.id)}
                className={`flex min-h-[68px] w-full items-center gap-4 border-b border-white/10 px-2 py-4 text-left transition-colors
                  ${openId === c.id ? 'bg-surface' : 'hover:bg-surface/60'}`}>
                <Avatar name={c.profile.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display text-xs font-bold uppercase tracking-[0.15em]">{c.profile.name}</p>
                    {last.from === 'client' && <span className="h-1.5 w-1.5 shrink-0 bg-gold" />}
                  </div>
                  <p className="mt-1 truncate text-xs text-mute">{last.from === 'trainer' ? 'You — ' : ''}{last.text}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex h-[60vh] flex-col border border-white/10 bg-surface lg:h-auto">
        {open ? (
          <>
            <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
              <Avatar name={open.profile.name} size="sm" />
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-[0.15em]">{open.profile.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-mute">
                  {LABELS.goal[open.profile.goal]} — {open.profile.daysPerWeek} D/WK
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6">
              {open.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'trainer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 sm:max-w-[70%] ${m.from === 'trainer' ? 'bg-ink text-obsidian' : 'border border-white/10 bg-obsidian text-ink'}`}>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    <p className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${m.from === 'trainer' ? 'text-obsidian/50' : 'text-mute'}`}>{m.ts}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="flex items-center gap-3 border-t border-white/10 p-4">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message"
                className="min-h-[48px] flex-1 rounded-none border border-white/10 bg-obsidian px-4 text-[15px] text-ink placeholder-white/25 outline-none transition-colors focus:border-gold/60" />
              <button type="submit" disabled={!text.trim()}
                className={`flex h-12 w-12 shrink-0 items-center justify-center transition-colors ${text.trim() ? 'bg-gold text-obsidian hover:bg-ink' : 'bg-surface-2 text-white/25'}`}>
                <Send className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-10 text-[10px] uppercase tracking-[0.3em] text-white/25">
            Select a thread
          </div>
        )}
      </div>
    </div>
  )
}
