import { useEffect, useRef, useState } from 'react'
import {
  LayoutGrid, CalendarRange, LineChart, MessageSquare, Send, ArrowRight, NotebookPen, ImagePlus, Dumbbell, Play,
  CheckCircle2, Flame, Award, ChevronRight, User, Shield, Sparkles, AlertCircle
} from 'lucide-react'
import Shell from '../components/Shell.jsx'
import { Card, Badge, BigCheck, Divider, Btn, SectionTitle, Label, TextInput, TextArea, Select, Avatar } from '../components/ui.jsx'
import { AttachmentStrip } from '../components/Attachments.jsx'
import { LABELS } from '../lib/planGenerator.js'
import { nowStamp, isoDate, dateLabel } from '../lib/store.js'
import { fetchExerciseById, fetchHomeWorkoutVideoById } from '../lib/supabase.js'
import ExerciseLibrary from './ExerciseLibrary.jsx'
import ExerciseDetailModal from '../components/ExerciseDetailModal.jsx'
import ActiveWorkoutPlayer from '../components/ActiveWorkoutPlayer.jsx'

// Clean 5-tab Mobile-First Navigation
const NAV = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'plan', label: 'Workouts', icon: CalendarRange },
  { id: 'library', label: 'Library', icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: LineChart },
  { id: 'profile', label: 'Profile', icon: User },
]

// Editorial session titles per focus
const FOCUS_TITLE = {
  'Push': 'Push — Hypertrophy',
  'Pull': 'Pull — Hypertrophy',
  'Legs': 'Lower — Hypertrophy',
  'Upper': 'Upper Body',
  'Lower': 'Lower Body',
  'Full Body': 'Full Body',
  'Full Body A': 'Full Body — A',
  'Full Body B': 'Full Body — B',
  'Conditioning': 'Conditioning',
  'Active Recovery': 'Recovery',
}

const sessionTitle = (focus) => FOCUS_TITLE[focus] || focus

export default function ClientPortal({ client, trainerName, onUpdate, onLogout }) {
  const [tab, setTab] = useState('home')
  const [previewExercise, setPreviewExercise] = useState(null)
  const [activeWorkoutMode, setActiveWorkoutMode] = useState(false)
  const p = client.profile

  const trainingDays = (client.plan || []).filter((d) => !d.rest)
  const doneCount = trainingDays.filter((d) => client.completed[d.day]).length
  const pct = trainingDays.length ? Math.round((doneCount / trainingDays.length) * 100) : 0

  const toggleExercise = (day, exIdx) => {
    const key = `${day}:${exIdx}`
    const exDone = { ...(client.exerciseDone || {}) }
    exDone[key] = !exDone[key]
    // Auto-mark session complete when all exercises are checked
    const dayPlan = client.plan.find((d) => d.day === day)
    const allDone = dayPlan.exercises.every((_, i) => exDone[`${day}:${i}`])
    onUpdate({ ...client, exerciseDone: exDone, completed: { ...client.completed, [day]: allDone } })
  }

  const handleCompleteFullSession = (day) => {
    const dayPlan = (client.plan || []).find((d) => d.day === day)
    const exDone = { ...(client.exerciseDone || {}) }
    if (dayPlan?.exercises) {
      dayPlan.exercises.forEach((_, i) => {
        exDone[`${day}:${i}`] = true
      })
    }
    onUpdate({
      ...client,
      exerciseDone: exDone,
      completed: { ...client.completed, [day]: true },
    })
  }

  const sendMessage = (text) => {
    onUpdate({ ...client, messages: [...client.messages, { from: 'client', text, ts: nowStamp() }] })
  }

  const submitCheckIn = (entry) => {
    const updated = { ...client, checkIns: [...(client.checkIns || []), entry] }
    // Bodyweight from a check-in feeds the progress trend automatically
    if (entry.weight && !isNaN(parseFloat(entry.weight))) {
      updated.weightLog = [...(client.weightLog || []), { date: dateLabel(entry.date), value: parseFloat(entry.weight) }]
    }
    onUpdate(updated)
  }

  const openPreview = async (name) => {
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
        equipment: client.profile.equipment || 'Bodyweight',
        instructions: ['Execute with steady tempo, strict spinal alignment, and controlled eccentric descent.'],
        form_cues: ['Keep core braced throughout movement.'],
        common_mistakes: ['Rushing repetition tempo.'],
        breathing: 'Inhale during lowering phase; exhale during concentric exertion.',
        source_name: 'X FIT FORMULA Home Workout Protocol',
        isHomeWorkout: true,
      })
    }
  }

  const shellUser = { name: p.name, subtitle: `${LABELS.goal[p.goal]} — ${p.daysPerWeek}D/WK` }

  const todayName = new Date().toLocaleDateString('en-IN', { weekday: 'long' })
  const todayPlan = (client.plan || []).find((d) => d.day === todayName)

  return (
    <Shell user={shellUser} roleLabel="Client" nav={NAV} active={tab} onNav={setTab} onLogout={onLogout}>
      {tab === 'home' && (
        <TodayView
          client={client}
          pct={pct}
          doneCount={doneCount}
          trainingDays={trainingDays}
          toggleExercise={toggleExercise}
          onGoTo={setTab}
          onPreview={openPreview}
          onStartWorkout={() => setActiveWorkoutMode(true)}
        />
      )}
      {tab === 'plan' && <ProgramView client={client} toggleExercise={toggleExercise} onPreview={openPreview} onStartWorkout={() => setActiveWorkoutMode(true)} />}
      {tab === 'library' && <ExerciseLibrary embedded={true} />}
      {tab === 'progress' && <ProgressView client={client} pct={pct} doneCount={doneCount} trainingDays={trainingDays} onSubmitCheckIn={submitCheckIn} />}
      {tab === 'profile' && <ProfileView client={client} trainerName={trainerName} onSendCoachMessage={sendMessage} onLogout={onLogout} />}

      {/* Exercise Detail Modal */}
      {previewExercise && (
        <ExerciseDetailModal
          exercise={previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}

      {/* Mobile Interactive Workout Mode */}
      {activeWorkoutMode && todayPlan && (
        <ActiveWorkoutPlayer
          plan={todayPlan}
          client={client}
          onCompleteSession={handleCompleteFullSession}
          onClose={() => setActiveWorkoutMode(false)}
        />
      )}
    </Shell>
  )
}

// ─── Mobile Home Screen / Today Dashboard ──────────────────────────────────

function TodayView({ client, pct, doneCount, trainingDays, toggleExercise, onGoTo, onPreview, onStartWorkout }) {
  const p = client.profile
  const assigned = client.planStatus === 'assigned'
  const todayName = new Date().toLocaleDateString('en-IN', { weekday: 'long' })
  const todayPlan = (client.plan || []).find((d) => d.day === todayName)
  const isRest = !todayPlan || todayPlan.rest
  const dayNumber = todayPlan && !todayPlan.rest
    ? String(trainingDays.findIndex((d) => d.day === todayName) + 1).padStart(2, '0')
    : null

  const exDone = client.exerciseDone || {}
  const doneInSession = todayPlan?.exercises ? todayPlan.exercises.filter((_, i) => exDone[`${todayPlan.day}:${i}`]).length : 0
  const isSessionComplete = client.completed[todayName]

  return (
    <div className="animate-fade-up space-y-6 sm:space-y-8">
      {/* 1. Header & Greeting (Mobile First Hierarchy) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-wide sm:text-4xl text-ink">
            {p.name.split(' ')[0]}
          </h1>
        </div>

        {/* Adherence Mini Badge */}
        <div className="flex items-center gap-3 border border-white/10 bg-surface px-3 py-2">
          <div className="text-right">
            <p className="font-display text-sm font-bold text-gold">{pct}%</p>
            <p className="text-[8px] uppercase tracking-wider text-mute">Week Adherence</p>
          </div>
          <div className="h-8 w-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-full bg-gold transition-all" style={{ height: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Today's Workout Hero Block */}
      {!assigned ? (
        <PendingBlock />
      ) : isRest ? (
        <div className="border border-white/10 bg-surface p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Badge tone="mute">Rest & Adaptation</Badge>
            <span className="text-[9px] uppercase tracking-widest text-mute">{todayName}</span>
          </div>
          <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-ink">
            Rest Protocol
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-mute max-w-lg">
            No intense session programmed today. Focus on 7–9 hours sleep, hitting protein targets, and active recovery walks.
          </p>
          <div className="mt-6 flex gap-3">
            <Btn variant="ghost" onClick={() => onGoTo('plan')} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
              View Week Program <ArrowRight className="h-4 w-4" />
            </Btn>
            <Btn variant="primary" onClick={() => onGoTo('library')} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
              Browse Library <Dumbbell className="h-4 w-4" />
            </Btn>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden border border-white/15 bg-surface p-6 sm:p-8 shadow-xl">
          {/* Subtle gold accent border at top */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold via-gold/80 to-gold-dim" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-gold/10 text-gold border border-gold/30">
              <Flame className="h-3 w-3" /> Day {dayNumber} • Today's Protocol
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-mute">
              {todayPlan.exercises.length} Movements • ~{client.planMeta?.rx?.sets || '3'} Sets
            </span>
          </div>

          <h2 className="mt-4 font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-[0.06em] text-ink">
            {sessionTitle(todayPlan.focus)}
          </h2>

          <p className="mt-2 text-xs uppercase tracking-wider text-mute">
            {LABELS.goal[p.goal]} • {LABELS.equipment[p.equipment]}
          </p>

          {/* PRIMARY PROMINENT START WORKOUT ACTION (Mobile-First) */}
          <div className="mt-6 sm:mt-8">
            <button
              onClick={onStartWorkout}
              className="flex min-h-[56px] w-full items-center justify-center gap-3 bg-gold text-obsidian font-display text-sm font-extrabold uppercase tracking-[0.25em] shadow-xl shadow-gold/20 transition-all hover:bg-ink active:scale-98"
            >
              <Play className="h-4 w-4 fill-current" />
              {isSessionComplete ? 'REPLAY WORKOUT' : doneInSession > 0 ? `CONTINUE WORKOUT (${doneInSession}/${todayPlan.exercises.length})` : 'START WORKOUT'}
            </button>
          </div>

          {/* Quick Exercise List Strip */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between pb-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
                Movement Checklist
              </p>
              <span className="text-[9px] text-gold font-semibold">
                {doneInSession}/{todayPlan.exercises.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {todayPlan.exercises.map((ex, i) => {
                const checked = !!exDone[`${todayPlan.day}:${i}`]
                return (
                  <div
                    key={`${ex.name}-${i}`}
                    className="flex items-center justify-between border border-white/5 bg-surface-2 p-3 transition-colors hover:border-white/20"
                  >
                    <button
                      type="button"
                      onClick={() => onPreview && onPreview(ex.name)}
                      className="flex items-center gap-2.5 min-w-0 text-left"
                    >
                      <span className="text-[10px] font-bold text-white/30">{String(i + 1).padStart(2, '0')}</span>
                      <span className={`truncate text-xs font-bold uppercase tracking-wider ${checked ? 'text-white/30 line-through' : 'text-ink'}`}>
                        {ex.name}
                      </span>
                      <span className="shrink-0 flex items-center gap-1 text-[8px] text-gold font-bold uppercase border border-gold/20 px-1 py-0.5">
                        <Play className="h-1.5 w-1.5 fill-current" /> Demo
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExercise(todayPlan.day, i)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-colors ${
                        checked ? 'border-gold bg-gold text-obsidian' : 'border-white/20 text-transparent hover:border-white/50'
                      }`}
                      aria-label={`Mark ${ex.name} complete`}
                    >
                      {checked && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Streak & Weekly Status Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="border border-white/10 bg-surface p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mute">Completed</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-ink">
            {doneCount} <span className="text-sm font-medium text-mute">/ {trainingDays.length} sessions</span>
          </p>
        </div>

        <div className="border border-white/10 bg-surface p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mute">Split Focus</p>
          <p className="mt-1 font-display text-sm font-bold uppercase tracking-wider text-gold truncate">
            {client.planMeta?.split || `${p.daysPerWeek} Day Split`}
          </p>
        </div>

        <div className="col-span-2 border border-white/10 bg-surface p-4 sm:col-span-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mute">Assigned Coach</p>
          <p className="mt-1 font-display text-sm font-bold text-ink truncate">
            {client.planMeta?.assignedBy || 'Head Coach'}
          </p>
        </div>
      </div>

      {/* 4. Workout Library Shortcut Card (Discoverability) */}
      <div
        onClick={() => onGoTo('library')}
        className="group flex items-center justify-between border border-white/10 bg-surface p-5 transition-colors hover:border-gold/60 cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <span className="flex h-10 w-10 items-center justify-center bg-gold/10 text-gold border border-gold/30">
            <Dumbbell className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-ink group-hover:text-gold transition-colors">
              Explore Workout Library
            </p>
            <p className="text-[10px] text-mute">
              Search 10+ biomechanically verified movement protocols
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-mute group-hover:text-gold transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  )
}

// ─── Workouts Program View (Week Schedule) ──────────────────────────────────

function ProgramView({ client, toggleExercise, onPreview, onStartWorkout }) {
  const plan = client.plan || []
  const trainingDays = plan.filter((d) => !d.rest)
  const [sel, setSel] = useState(() => Math.max(plan.findIndex((d) => !d.rest), 0))

  if (client.planStatus !== 'assigned') {
    return <div className="animate-fade-up"><PendingBlock /></div>
  }

  const active = plan[sel]
  const dayNum = active && !active.rest
    ? String(trainingDays.findIndex((d) => d.day === active.day) + 1).padStart(2, '0')
    : null

  return (
    <div className="animate-fade-up space-y-6 sm:space-y-8">
      <div>
        <SectionTitle kicker="Weekly Program">{client.planMeta?.split || 'Training Week'}</SectionTitle>
        {client.planMeta?.assignedBy && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-mute">Programmed by {client.planMeta.assignedBy}</p>
        )}
      </div>

      {/* Day strip with horizontal scroll on small devices */}
      <div className="grid grid-cols-7 gap-px border border-white/10 bg-white/10 overflow-x-auto no-scrollbar">
        {plan.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setSel(i)}
            className={`flex min-h-[58px] min-w-[44px] flex-col items-center justify-center gap-1 transition-colors
              ${sel === i ? 'bg-ink text-obsidian' : d.rest ? 'bg-obsidian text-white/20' : 'bg-surface text-mute hover:text-ink'}`}
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{d.day.slice(0, 3)}</span>
            <span className={`h-1.5 w-1.5 ${d.rest ? 'bg-transparent' : client.completed[d.day] ? 'bg-gold' : sel === i ? 'bg-obsidian/40' : 'bg-white/25'}`} />
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active.rest ? (
          <div className="border border-white/10 bg-surface p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-mute">{active.day}</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.1em] text-white/25">Rest Protocol</h2>
            <p className="mt-4 max-w-md text-xs sm:text-sm leading-relaxed text-mute">
              Active recovery day. Protein compliance and tissue rest allow adaptation.
            </p>
          </div>
        ) : (
          <SessionBlock
            dayLabel={`Day ${dayNum}`}
            plan={active}
            client={client}
            toggleExercise={toggleExercise}
            rx={client.planMeta?.rx}
            onPreview={onPreview}
            onStartWorkout={onStartWorkout}
          />
        )}
      </div>
    </div>
  )
}

function SessionBlock({ dayLabel, plan, client, toggleExercise, rx, onPreview, onStartWorkout }) {
  const exDone = client.exerciseDone || {}
  const doneInSession = plan.exercises.filter((_, i) => exDone[`${plan.day}:${i}`]).length
  const complete = client.completed[plan.day]

  return (
    <div className="border border-white/10 bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-mute">{plan.day}</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-[0.08em] sm:text-4xl">
            <span className="text-gold">{dayLabel}</span>
            <span className="mx-2 text-white/20 sm:mx-4">—</span>
            {sessionTitle(plan.focus)}
          </h2>
        </div>
        {complete
          ? <Badge tone="gold">Complete</Badge>
          : <Badge tone="mute">{doneInSession}/{plan.exercises.length} Done</Badge>}
      </div>

      {rx && (
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-white/10 py-3.5">
          {[['Sets', rx.sets], ['Reps', rx.reps], ['Rest', rx.rest]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/30">{k}</p>
              <p className="mt-0.5 font-display text-sm font-bold tracking-wide text-ink">{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Workout Button */}
      {onStartWorkout && (
        <div className="mt-6">
          <Btn variant="gold" onClick={onStartWorkout} className="w-full flex items-center justify-center gap-2 text-xs font-bold">
            <Play className="h-3.5 w-3.5 fill-current" /> Open Active Workout Player
          </Btn>
        </div>
      )}

      {/* Exercise list with thumb-friendly rows */}
      <div className="mt-6 border-t border-white/10">
        {plan.exercises.map((ex, i) => {
          const checked = !!exDone[`${plan.day}:${i}`]
          return (
            <div
              key={`${ex.name}-${i}`}
              className="flex items-center gap-4 border-b border-white/10 py-4 sm:gap-6 sm:py-5"
            >
              <span className="w-6 shrink-0 font-display text-xs font-bold text-white/25">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onPreview && onPreview(ex.name)}
                  className="group/name flex items-center gap-2 text-left"
                >
                  <p className={`font-display text-sm font-bold uppercase tracking-[0.1em] transition-colors sm:text-base ${checked ? 'text-white/30 line-through' : 'text-ink group-hover/name:text-gold'}`}>
                    {ex.name}
                  </p>
                  <span className="inline-flex items-center gap-1 border border-gold/30 bg-gold/10 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-gold">
                    <Play className="h-1.5 w-1.5 fill-current" /> Demo
                  </span>
                </button>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-mute">
                  {ex.sets} sets — {ex.reps}
                </p>
              </div>
              <BigCheck checked={checked} onToggle={() => toggleExercise(plan.day, i)} label={`Mark ${ex.name}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Progress & Check-In View ──────────────────────────────────────────────

function ProgressView({ client, pct, doneCount, trainingDays, onSubmitCheckIn }) {
  const [viewMode, setViewMode] = useState('metrics') // 'metrics' | 'checkin'
  const log = client.weightLog || []
  const unit = client.profile.weightUnit || 'kg'

  return (
    <div className="animate-fade-up space-y-8">
      {/* Sub-tab Switcher */}
      <div className="flex border border-white/10">
        <button
          type="button"
          onClick={() => setViewMode('metrics')}
          className={`flex-1 min-h-[48px] text-[10px] font-bold uppercase tracking-[0.25em] transition-colors ${
            viewMode === 'metrics' ? 'bg-ink text-obsidian' : 'text-mute hover:text-ink'
          }`}
        >
          Progression Metrics
        </button>
        <button
          type="button"
          onClick={() => setViewMode('checkin')}
          className={`flex-1 min-h-[48px] text-[10px] font-bold uppercase tracking-[0.25em] transition-colors ${
            viewMode === 'checkin' ? 'bg-ink text-obsidian' : 'text-mute hover:text-ink'
          }`}
        >
          Daily Check-In
        </button>
      </div>

      {viewMode === 'metrics' ? (
        <div className="space-y-10">
          {/* Adherence Section */}
          <div className="border border-white/10 bg-surface p-6 sm:p-8">
            <SectionTitle kicker="Weekly Consistency">Adherence Rate</SectionTitle>
            <div className="mt-6 flex items-end gap-3">
              <p className="font-display text-6xl sm:text-7xl font-extrabold leading-none text-gold">{pct}</p>
              <div className="pb-1.5">
                <p className="font-display text-lg font-bold text-ink">%</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-mute">{doneCount} of {trainingDays.length} sessions completed</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Bodyweight Trend Section */}
          <div className="border border-white/10 bg-surface p-6 sm:p-8">
            <SectionTitle kicker="Biometric Log">Bodyweight Trend</SectionTitle>
            {log.length >= 2 ? (
              <WeightChart log={log} unit={unit} />
            ) : (
              <p className="mt-4 text-xs text-mute leading-relaxed">
                Log bodyweight across at least two daily reports to render your historical trendline.
              </p>
            )}
          </div>
        </div>
      ) : (
        <CheckInForm client={client} onSubmit={onSubmitCheckIn} />
      )}
    </div>
  )
}

function WeightChart({ log, unit }) {
  const values = log.map((l) => l.value)
  const min = Math.min(...values), max = Math.max(...values)
  const pad = (max - min) * 0.25 || 1
  const lo = min - pad, hi = max + pad
  const W = 340, H = 130
  const x = (i) => (i / (log.length - 1)) * (W - 24) + 12
  const y = (v) => H - 18 - ((v - lo) / (hi - lo)) * (H - 36)
  const points = log.map((l, i) => `${x(i)},${y(l.value)}`).join(' ')
  const delta = (values[values.length - 1] - values[0]).toFixed(1)

  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-4">
        <p className="font-display text-3xl sm:text-4xl font-extrabold text-ink">{values[values.length - 1]}<span className="ml-1 text-sm text-mute">{unit}</span></p>
        <Badge tone={delta <= 0 ? 'gold' : 'amber'}>{delta > 0 ? '+' : ''}{delta} {unit}</Badge>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 w-full border border-white/10 bg-obsidian">
        <polyline points={points} fill="none" stroke="#C6A87C" strokeWidth="1.5" strokeLinecap="square" />
        {log.map((l, i) => (
          <g key={l.date}>
            <rect x={x(i) - 2} y={y(l.value) - 2} width="4" height="4" fill="#050505" stroke="#C6A87C" strokeWidth="1" />
            <text x={x(i)} y={H - 5} textAnchor="middle" fontSize="7" fill="#888888" fontFamily="Inter" letterSpacing="0.5">{l.date.toUpperCase()}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function CheckInForm({ client, onSubmit }) {
  const [form, setForm] = useState({
    session: 'Completed as programmed',
    energy: 'medium',
    meals: '',
    protein: '',
    calories: '',
    water: '',
    sleep: '',
    weight: '',
    workoutNotes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      id: `ci-${Date.now()}`,
      date: isoDate(0),
      ...form,
      status: 'new',
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="border border-gold/40 bg-surface p-6 sm:p-8 text-center animate-fade-up">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h3 className="mt-4 font-display text-xl font-bold uppercase text-ink">Check-In Transmitted</h3>
        <p className="mt-2 text-xs text-mute">Your coach has been notified and will review your nutrition and training log.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-white/10 bg-surface p-6 sm:p-8 space-y-6 animate-fade-up">
      <SectionTitle kicker="Daily Log">Report Output</SectionTitle>

      <div>
        <Label>Energy Level</Label>
        <div className="grid grid-cols-3 gap-2">
          {['low', 'medium', 'high'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setForm({ ...form, energy: lvl })}
              className={`min-h-[44px] border text-[10px] font-bold uppercase tracking-wider ${
                form.energy === lvl ? 'border-gold bg-gold text-obsidian' : 'border-white/15 text-mute'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Weight ({client.profile.weightUnit || 'kg'})</Label>
          <TextInput
            type="number"
            step="0.1"
            placeholder="65.0"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
        </div>
        <div>
          <Label>Protein (g)</Label>
          <TextInput
            type="number"
            placeholder="130"
            value={form.protein}
            onChange={(e) => setForm({ ...form, protein: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Training Notes</Label>
        <TextArea
          rows={3}
          placeholder="Loads, sets, perceived exertion, joint sensations..."
          value={form.workoutNotes}
          onChange={(e) => setForm({ ...form, workoutNotes: e.target.value })}
        />
      </div>

      <div>
        <Label>Diet & Nutrition Log</Label>
        <TextArea
          rows={3}
          placeholder="Summary of all meals, hydration, snacks..."
          value={form.meals}
          onChange={(e) => setForm({ ...form, meals: e.target.value })}
        />
      </div>

      <Btn type="submit" variant="gold" className="w-full min-h-[52px]">
        Submit Daily Check-In
      </Btn>
    </form>
  )
}

// ─── Profile & Coach Chat View ─────────────────────────────────────────────

function ProfileView({ client, trainerName, onSendCoachMessage, onLogout }) {
  const p = client.profile
  const [msgText, setMsgText] = useState('')
  const endRef = useRef(null)

  const handleSend = (e) => {
    e.preventDefault()
    if (!msgText.trim()) return
    onSendCoachMessage(msgText.trim())
    setMsgText('')
  }

  return (
    <div className="animate-fade-up space-y-8">
      {/* Athlete Header Card */}
      <div className="border border-white/10 bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar name={p.name} size="lg" />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold uppercase text-ink truncate">{p.name}</h2>
            <p className="text-xs uppercase tracking-wider text-gold font-semibold">
              {LABELS.goal[p.goal]} Athlete
            </p>
            <p className="mt-0.5 text-[10px] text-mute">
              Joined {client.joined || '2026'} • Active Protocol
            </p>
          </div>
        </div>

        {/* Biometrics Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-mute">Age</p>
            <p className="font-display text-base font-bold text-ink">{p.age || '—'}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-mute">Height</p>
            <p className="font-display text-base font-bold text-ink">{p.height ? `${p.height} ${p.heightUnit}` : '—'}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-mute">Weight</p>
            <p className="font-display text-base font-bold text-ink">{p.weight ? `${p.weight} ${p.weightUnit}` : '—'}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-mute">Equipment</p>
            <p className="font-display text-base font-bold text-ink uppercase">{LABELS.equipment[p.equipment] || 'Gym'}</p>
          </div>
        </div>
      </div>

      {/* Direct Coach Messaging */}
      <div className="border border-white/10 bg-surface p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gold" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
              Direct Coach Line — {trainerName}
            </h3>
          </div>
          <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold">Online</span>
        </div>

        <div className="max-h-60 space-y-3 overflow-y-auto py-4">
          {(client.messages || []).length === 0 && (
            <p className="py-6 text-center text-xs text-mute">No messages yet. Send a message to your coach below.</p>
          )}
          {(client.messages || []).map((m, i) => (
            <div key={i} className={`flex ${m.from === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 text-xs ${
                m.from === 'client' ? 'bg-gold text-obsidian font-medium' : 'border border-white/10 bg-surface-2 text-ink'
              }`}>
                <p>{m.text}</p>
                <p className="mt-1 text-[8px] opacity-60 text-right">{m.ts}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="mt-3 flex gap-2 border-t border-white/10 pt-3">
          <input
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder="Message your coach..."
            className="flex-1 min-h-[48px] border border-white/10 bg-obsidian px-4 text-xs text-ink placeholder-white/25 outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={!msgText.trim()}
            className="flex h-12 w-12 items-center justify-center bg-gold text-obsidian disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Account / Logout */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 border border-red-500/30 bg-red-500/5 text-red-300 text-xs font-bold uppercase tracking-wider hover:bg-red-500/10"
        >
          Sign Out of Account
        </button>
      </div>
    </div>
  )
}

function PendingBlock() {
  return (
    <div className="border border-white/10 bg-surface p-6 sm:p-8">
      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Status</p>
      <h2 className="mt-2 font-display text-2xl font-extrabold uppercase text-ink">
        Program In Development
      </h2>
      <p className="mt-3 text-xs sm:text-sm text-mute leading-relaxed">
        Your intake assessment is received. Your coach is designing your customized protocol.
      </p>
    </div>
  )
}
