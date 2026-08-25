import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, LogOut, Lock, Check } from 'lucide-react'
import { Label, TextInput, TextArea, Select, UnitToggle, Btn, Divider } from '../components/ui.jsx'
import { LABELS } from '../lib/planGenerator.js'

export const GOALS = [
  { id: 'fatloss', label: 'Fat Loss', desc: 'Reduce body fat. Preserve muscle.' },
  { id: 'muscle', label: 'Muscle Gain', desc: 'Add lean mass. Build shape.' },
  { id: 'strength', label: 'Strength', desc: 'Move heavier loads.' },
  { id: 'general', label: 'General Fitness', desc: 'Capacity. Health. Longevity.' },
]

export const EQUIPMENT = [
  { id: 'gym', label: 'Full Gym', desc: 'Barbells, machines, cables.' },
  { id: 'dumbbells', label: 'Dumbbells Only', desc: 'A pair of dumbbells. Nothing else.' },
  { id: 'bodyweight', label: 'Bodyweight', desc: 'No equipment. Any location.' },
]

const LIFESTYLES = [
  { id: 'active', label: 'Highly Active' },
  { id: 'desk', label: 'Sedentary Desk Job' },
  { id: 'studying', label: 'Studying' },
]

export const initialProfile = {
  name: '', age: '', height: '', heightUnit: 'cm', weight: '', weightUnit: 'kg',
  gender: '', lifestyle: 'active', injuries: '',
  goal: '', equipment: '', experience: 'beginner', daysPerWeek: 3,
}

const STEP_TITLES = ['Profile', 'Objective', 'Protocol']

export default function Onboarding({ initialName = '', onComplete, onLogout }) {
  const [step, setStep] = useState(1) // 1..3, 4 = processing
  const [data, setData] = useState({ ...initialProfile, name: initialName })
  const set = (key, value) => setData((d) => ({ ...d, [key]: value }))

  // ── LOGIC MATRIX: beginners capped at 6 days/week ──
  const maxDays = data.experience === 'beginner' ? 6 : 7
  useEffect(() => {
    if (data.daysPerWeek > maxDays) set('daysPerWeek', maxDays)
  }, [maxDays]) // eslint-disable-line react-hooks/exhaustive-deps

  const stepValid = useMemo(() => {
    if (step === 1) return data.name.trim() && data.age && data.height && data.weight && data.gender
    if (step === 2) return data.goal && data.equipment
    if (step === 3) return data.experience && data.daysPerWeek >= 1
    return true
  }, [step, data])

  const handleGenerate = () => {
    setStep(4)
    setTimeout(() => onComplete(data), 2600)
  }

  return (
    <div className="min-h-screen bg-obsidian text-ink">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="X Fit Formula" className="h-7 w-7 rounded object-cover ring-1 ring-gold/25" />
          <span className="font-display text-xs font-bold uppercase tracking-[0.3em]">X FIT FORMULA — Intake</span>
        </div>
        <button onClick={onLogout} className="flex min-h-[44px] items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-mute transition-colors hover:text-gold">
          Exit <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 sm:px-8 sm:pt-16">
        {/* Progress */}
        {step <= 3 && (
          <div className="mb-14">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-5xl font-extrabold tracking-tight text-white/10 sm:text-6xl">
                0{step}
              </p>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold">{STEP_TITLES[step - 1]}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-mute">Section {step} of 3</p>
              </div>
            </div>
            <div className="mt-6 flex gap-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-px flex-1 transition-colors duration-500 ${s <= step ? 'bg-gold' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        )}

        {step === 1 && <StepProfile data={data} set={set} />}
        {step === 2 && <StepObjective data={data} set={set} />}
        {step === 3 && <StepProtocol data={data} set={set} maxDays={maxDays} />}
        {step === 4 && <Processing name={data.name} />}

        {step <= 3 && (
          <div className="mt-14 flex items-center gap-4">
            {step > 1 && (
              <Btn variant="ghost" onClick={() => setStep(step - 1)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back
              </Btn>
            )}
            <Btn
              variant="gold"
              disabled={!stepValid}
              onClick={() => (step === 3 ? handleGenerate() : setStep(step + 1))}
              className="flex flex-1 items-center justify-center gap-3"
            >
              {step === 3 ? 'Generate Formula' : 'Continue'}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Btn>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── 01 Profile ─────────────────────────────────────────────────────────────

function StepProfile({ data, set }) {
  return (
    <div className="animate-fade-up space-y-10">
      <div>
        <Label>Name</Label>
        <TextInput type="text" placeholder="Full name" value={data.name} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
        <div>
          <Label>Age</Label>
          <TextInput type="number" min="13" max="100" placeholder="—" value={data.age} onChange={(e) => set('age', e.target.value)} />
        </div>
        <div>
          <Label>Height</Label>
          <div className="flex items-end gap-3">
            <TextInput type="number" min="0" placeholder="—" value={data.height} onChange={(e) => set('height', e.target.value)} />
            <UnitToggle options={['cm', 'in']} value={data.heightUnit} onChange={(u) => set('heightUnit', u)} />
          </div>
        </div>
        <div>
          <Label>Weight</Label>
          <div className="flex items-end gap-3">
            <TextInput type="number" min="0" placeholder="—" value={data.weight} onChange={(e) => set('weight', e.target.value)} />
            <UnitToggle options={['kg', 'lbs']} value={data.weightUnit} onChange={(u) => set('weightUnit', u)} />
          </div>
        </div>
      </div>

      <div>
        <Label>Gender</Label>
        <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10">
          {[
            { id: 'men', label: 'Men' },
            { id: 'women', label: 'Women' },
          ].map((g) => (
            <label
              key={g.id}
              className={`flex min-h-[56px] cursor-pointer items-center justify-center text-[11px] font-bold uppercase tracking-[0.3em] transition-colors
                ${data.gender === g.id ? 'bg-ink text-obsidian' : 'bg-surface text-mute hover:text-ink'}`}
            >
              <input type="radio" name="gender" value={g.id} checked={data.gender === g.id} onChange={() => set('gender', g.id)} className="sr-only" />
              {g.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Lifestyle</Label>
        <Select value={data.lifestyle} onChange={(e) => set('lifestyle', e.target.value)}>
          {LIFESTYLES.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label hint="Visible to your trainer">Injuries / Limitations</Label>
        <TextArea
          rows={3}
          placeholder="Lower back, knees, shoulders — state anything that restricts movement."
          value={data.injuries}
          onChange={(e) => set('injuries', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── 02 Objective ───────────────────────────────────────────────────────────

function StepObjective({ data, set }) {
  return (
    <div className="animate-fade-up space-y-12">
      <div>
        <Label>Primary Goal</Label>
        <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
          {GOALS.map((g, i) => (
            <button
              key={g.id}
              type="button"
              onClick={() => set('goal', g.id)}
              className={`flex min-h-[96px] flex-col justify-center px-6 py-5 text-left transition-colors
                ${data.goal === g.id ? 'bg-ink' : 'bg-surface hover:bg-surface-2'}`}
            >
              <span className={`text-[9px] font-semibold uppercase tracking-[0.35em] ${data.goal === g.id ? 'text-obsidian/50' : 'text-gold'}`}>
                0{i + 1}
              </span>
              <span className={`mt-1.5 font-display text-sm font-bold uppercase tracking-[0.2em] ${data.goal === g.id ? 'text-obsidian' : 'text-ink'}`}>
                {g.label}
              </span>
              <span className={`mt-1 text-xs ${data.goal === g.id ? 'text-obsidian/60' : 'text-mute'}`}>{g.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Equipment</Label>
        <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10">
          {EQUIPMENT.map((eq) => (
            <button
              key={eq.id}
              type="button"
              onClick={() => set('equipment', eq.id)}
              className={`flex min-h-[72px] items-center justify-between px-6 py-5 text-left transition-colors
                ${data.equipment === eq.id ? 'bg-ink' : 'bg-surface hover:bg-surface-2'}`}
            >
              <div>
                <span className={`font-display text-sm font-bold uppercase tracking-[0.2em] ${data.equipment === eq.id ? 'text-obsidian' : 'text-ink'}`}>
                  {eq.label}
                </span>
                <p className={`mt-1 text-xs ${data.equipment === eq.id ? 'text-obsidian/60' : 'text-mute'}`}>{eq.desc}</p>
              </div>
              {data.equipment === eq.id && <Check className="h-4 w-4 text-obsidian" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 03 Protocol (logic matrix) ─────────────────────────────────────────────

function StepProtocol({ data, set, maxDays }) {
  return (
    <div className="animate-fade-up space-y-12">
      <div>
        <Label>Experience Level</Label>
        <Select value={data.experience} onChange={(e) => set('experience', e.target.value)}>
          <option value="beginner">Beginner — under one year</option>
          <option value="intermediate">Intermediate — one to three years</option>
          <option value="advanced">Advanced — three years plus</option>
        </Select>
      </div>

      <div>
        <Label hint={`Maximum ${maxDays} — ${LABELS.experience[data.experience]}`}>Days Per Week</Label>
        <div className="grid grid-cols-7 gap-px border border-white/10 bg-white/10">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const locked = d > maxDays
            const selected = data.daysPerWeek === d
            return (
              <button
                key={d}
                type="button"
                disabled={locked}
                onClick={() => set('daysPerWeek', d)}
                className={`relative flex aspect-square min-h-[48px] items-center justify-center font-display text-base font-bold transition-colors
                  ${locked
                    ? 'cursor-not-allowed bg-obsidian text-white/15'
                    : selected
                      ? 'bg-gold text-obsidian'
                      : 'bg-surface text-mute hover:text-ink'}`}
              >
                {locked ? <Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> : d}
              </button>
            )
          })}
        </div>
        {data.experience === 'beginner' && (
          <p className="mt-4 border-l border-gold/50 pl-4 text-xs leading-relaxed text-mute">
            Beginner protocol is capped at six sessions per week. Adaptation occurs during recovery.
            Seven-day programming unlocks at Intermediate.
          </p>
        )}
      </div>

      <div>
        <Divider className="mb-6" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-mute">Formula Summary</p>
        <div className="mt-4 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          {[
            ['Level', LABELS.experience[data.experience]],
            ['Frequency', `${data.daysPerWeek} D / WK`],
            ['Goal', LABELS.goal[data.goal] || '—'],
            ['Equipment', LABELS.equipment[data.equipment] || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">{k}</p>
              <p className="mt-1 font-display text-sm font-bold uppercase tracking-[0.1em] text-gold">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Processing ─────────────────────────────────────────────────────────────

const PROC_MSGS = [
  'Analyzing profile',
  'Calculating volume',
  'Resolving equipment constraints',
  'Structuring weekly split',
  'Finalizing formula',
]

function Processing({ name }) {
  const [msgIdx, setMsgIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => Math.min(i + 1, PROC_MSGS.length - 1)), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="animate-fade-up py-20 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold">Processing</p>
      <h2 className="mt-6 font-display text-3xl font-extrabold uppercase tracking-[0.15em] sm:text-4xl">
        {name ? name.split(' ')[0] : 'Athlete'}
      </h2>
      <div className="mx-auto mt-12 h-px w-full max-w-sm bg-white/10">
        <div className="load-bar h-px bg-gold" />
      </div>
      <p className="blink mt-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-mute">
        {PROC_MSGS[msgIdx]}
      </p>
    </div>
  )
}
