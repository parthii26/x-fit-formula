import { useEffect, useRef, useState } from 'react'
import {
  X, Play, Pause, RotateCcw, ShieldCheck, Dumbbell, Flame, Info,
  CheckCircle2, AlertTriangle, Wind, User, Users, AlertCircle, Clock, Check, Sparkles, Timer, Activity, FastForward, Film
} from 'lucide-react'
import { DifficultyBadge, EquipmentBadge, CategoryBadge, MuscleBadge } from './badges.jsx'
import { getOpenSourceDemo, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../lib/openSourceMedia.js'

export default function ExerciseDetailModal({ exercise, onClose }) {
  const isHomeWorkout = Boolean(exercise?.isHomeWorkout)
  const openSourceDemo = getOpenSourceDemo(exercise?.slug || exercise?.name || exercise?.exercise_name)
  const youtubeUrl = openSourceDemo?.videoUrl || exercise?.video_url || exercise?.videoUrl || exercise?.source_url || null
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl)

  // Gender support for dual-demo movements
  const hasMale = Boolean(exercise?.male_video_path || exercise?.maleVideoUrl)
  const hasFemale = Boolean(exercise?.female_video_path || exercise?.femaleVideoUrl)
  const hasBothGenders = hasMale && hasFemale

  const [gender, setGender] = useState(hasMale ? 'male' : 'female')
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeFrameIndex, setActiveFrameIndex] = useState(0)
  const [loopSpeed, setLoopSpeed] = useState(1100) // ms per frame (1100ms standard, 750ms fast, 1600ms slow)
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null)
  const [videoError, setVideoError] = useState(false)
  const [viewMode, setViewMode] = useState(embedUrl ? 'video' : 'motion') // 'video' | 'motion'
  const videoRef = useRef(null)

  // Follow-Along Workout Companion State
  const [activeSet, setActiveSet] = useState(1)
  const totalSets = 3
  const [completedSets, setCompletedSets] = useState([])
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)

  // Cadence metronome phase (0: Eccentric / Lower, 1: Concentric / Squeeze)
  const [cadencePhase, setCadencePhase] = useState('eccentric')

  // Clean modal scroll lock on body
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow || ''
    }
  }, [onClose])

  // Resolve native MP4 if available
  useEffect(() => {
    if (!exercise) return
    const rawUrl = gender === 'female'
      ? (exercise.femaleVideoUrl || exercise.female_video_path)
      : (exercise.maleVideoUrl || exercise.male_video_path)

    const normalized = rawUrl?.endsWith('.mp4') ? rawUrl : null
    setCurrentVideoSrc(normalized)
    setVideoError(!normalized)
  }, [gender, exercise])

  // Automated Smooth Motion Loop
  useEffect(() => {
    if (!openSourceDemo?.frames?.length || !isPlaying || viewMode !== 'motion') return

    const interval = setInterval(() => {
      setActiveFrameIndex((prev) => {
        const next = (prev + 1) % openSourceDemo.frames.length
        setCadencePhase(next === 0 ? 'eccentric' : 'concentric')
        return next
      })
    }, loopSpeed)

    return () => clearInterval(interval)
  }, [openSourceDemo, isPlaying, loopSpeed, viewMode])

  // Rest Timer countdown
  useEffect(() => {
    let interval = null
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false)
            if (typeof window !== 'undefined' && window.AudioContext) {
              try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.frequency.setValueAtTime(880, ctx.currentTime)
                gain.gain.setValueAtTime(0.2, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
                osc.start()
                osc.stop(ctx.currentTime + 0.35)
              } catch { /* ignore audio failure */ }
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isResting, restTimer])

  if (!exercise) return null

  const levelOrDifficulty = exercise.level || exercise.difficulty || 'Beginner'
  const exerciseTitle = exercise.video_title || exercise.title || exercise.name || exercise.exercise_name
  const exerciseName = exercise.name || exercise.exercise_name
  const targetMuscle = exercise.target || exercise.target_muscle || 'Full Body'
  const frames = openSourceDemo?.frames || []

  const completeSet = (setNum) => {
    if (!completedSets.includes(setNum)) {
      setCompletedSets((prev) => [...prev, setNum])
    }
    if (setNum < totalSets) {
      setActiveSet(setNum + 1)
      setRestTimer(60)
      setIsResting(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 lg:p-8 animate-fade-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative z-10 flex h-[94dvh] sm:h-auto sm:max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-white/15 bg-surface text-ink shadow-2xl rounded-t-2xl sm:rounded-none">
        {/* Mobile Pull Bar Indicator */}
        <div className="flex sm:hidden justify-center pt-2 pb-1 bg-obsidian border-b border-white/5">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Top Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-obsidian px-4 py-3.5 sm:px-8 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-gold/10 text-gold border border-gold/30">
              <Dumbbell className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] text-gold">
                {exercise.isGymWorkout
                  ? `Gym Workout • ${levelOrDifficulty} • ${exercise.day || ''}${exercise.split_name ? ` (${exercise.split_name})` : ''}`
                  : isHomeWorkout
                  ? `Home Workout • ${levelOrDifficulty}`
                  : 'Movement Protocol'}
              </span>
              <h3 className="truncate font-display text-base font-extrabold uppercase tracking-wide text-ink sm:text-xl">
                {exerciseName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-mute transition-colors hover:border-white/30 hover:text-ink active:bg-surface-2"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 safe-area-bottom">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Native Movement Visualizer & Session Tracker */}
            <div className="flex flex-col gap-3.5 lg:col-span-5">
              {/* Media View Mode Switcher (If both video embed and motion loop are available) */}
              {embedUrl && frames.length > 0 && !currentVideoSrc && (
                <div className="flex items-center gap-1 border border-white/10 bg-surface-2 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('video')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      viewMode === 'video'
                        ? 'bg-gold text-obsidian font-extrabold shadow-sm'
                        : 'text-mute hover:text-ink'
                    }`}
                  >
                    <Play className="h-3 w-3 fill-current" /> HD Video Tutorial
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('motion')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      viewMode === 'motion'
                        ? 'bg-gold text-obsidian font-extrabold shadow-sm'
                        : 'text-mute hover:text-ink'
                    }`}
                  >
                    <Activity className="h-3 w-3" /> Motion Loop
                  </button>
                </div>
              )}

              {/* Native Motion / Video Demonstration Box */}
              <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-obsidian shadow-2xl flex items-center justify-center">
                {currentVideoSrc && !videoError ? (
                  <video
                    ref={videoRef}
                    key={`${exercise.slug}-${gender}-${currentVideoSrc}`}
                    src={currentVideoSrc}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-contain bg-obsidian"
                  />
                ) : viewMode === 'video' && embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={`${exerciseName} Video Tutorial`}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : frames.length > 0 ? (
                  <div className="relative h-full w-full bg-obsidian flex flex-col items-center justify-between">
                    <img
                      src={frames[activeFrameIndex] || frames[0]}
                      alt={`${exerciseName} continuous motion`}
                      className="h-full w-full object-contain bg-obsidian transition-all duration-300 select-none"
                    />

                    {/* Active Cadence & Position Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-obsidian/85 px-2.5 py-1 border border-white/15 backdrop-blur-md">
                      <span className={`h-2 w-2 rounded-full ${activeFrameIndex === 0 ? 'bg-amber-400' : 'bg-gold animate-pulse'}`} />
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink font-mono">
                        {activeFrameIndex === 0 ? '1. Starting Stance' : '2. Peak Contraction'}
                      </span>
                    </div>

                    {/* Native Motion Control Bar */}
                    <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between bg-obsidian/90 px-3 py-2 border border-white/15 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gold text-obsidian text-[9px] font-extrabold uppercase tracking-wider hover:bg-white transition-colors"
                        >
                          {isPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                          {isPlaying ? 'Pause' : 'Play Motion'}
                        </button>
                      </div>

                      {/* Speed Control */}
                      <div className="flex items-center gap-1">
                        {[
                          { label: '0.8x', speed: 1600 },
                          { label: '1.0x', speed: 1100 },
                          { label: '1.4x', speed: 750 },
                        ].map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onClick={() => {
                              setLoopSpeed(s.speed)
                              setIsPlaying(true)
                            }}
                            className={`px-1.5 py-0.5 text-[8px] font-bold uppercase transition-all ${
                              loopSpeed === s.speed
                                ? 'bg-gold text-obsidian font-extrabold'
                                : 'bg-white/10 text-mute hover:bg-white/20'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {/* Step P1/P2 manual selectors */}
                      <div className="flex items-center gap-1">
                        {frames.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setActiveFrameIndex(i)
                              setIsPlaying(false)
                            }}
                            className={`flex items-center justify-center text-[8px] font-extrabold uppercase px-1.5 py-0.5 transition-all ${
                              activeFrameIndex === i
                                ? 'bg-gold text-obsidian font-bold'
                                : 'bg-white/10 text-mute hover:bg-white/20'
                            }`}
                          >
                            P{i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-2">
                    <Dumbbell className="h-16 w-16 text-white/20" strokeWidth={1} />
                  </div>
                )}

                {/* Badges Over Visualizer */}
                <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 pointer-events-none">
                  <CategoryBadge category={exercise.category || (isHomeWorkout ? 'Home' : 'Gym')} />
                  <DifficultyBadge difficulty={levelOrDifficulty} />
                </div>
              </div>

              {/* Gender Switcher (If available) */}
              {!isHomeWorkout && hasBothGenders && (
                <div className="flex items-center justify-between gap-2 border border-white/10 bg-surface-2 p-2">
                  <div className="flex border border-white/10">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                        gender === 'male' ? 'bg-gold text-obsidian' : 'text-mute hover:text-ink'
                      }`}
                    >
                      <User className="h-3 w-3" strokeWidth={1.75} /> Male Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                        gender === 'female' ? 'bg-gold text-obsidian' : 'text-mute hover:text-ink'
                      }`}
                    >
                      <User className="h-3 w-3" strokeWidth={1.75} /> Female Demo
                    </button>
                  </div>
                </div>
              )}

              {/* Repetition Cadence & Breathing Metronome */}
              <div className="border border-white/10 bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-gold" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
                      Execution Tempo Cadence
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/60">2-1-1-0 Tempo</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-obsidian p-2 text-center border border-white/5">
                    <p className="text-[8px] uppercase tracking-wider text-mute">Descent / Eccentric</p>
                    <p className="text-[11px] font-bold text-ink">2.0s Inhale</p>
                  </div>
                  <div className="flex-1 bg-obsidian p-2 text-center border border-white/5">
                    <p className="text-[8px] uppercase tracking-wider text-mute">Drive / Concentric</p>
                    <p className="text-[11px] font-bold text-gold">1.0s Exhale</p>
                  </div>
                </div>
              </div>

              {/* Interactive Follow-Along Workout Companion */}
              <div className="border border-gold/40 bg-gold/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-gold" />
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                      Follow-Along Workout Sets
                    </h5>
                  </div>
                  <span className="text-[9px] font-bold uppercase text-mute">
                    {completedSets.length} of {totalSets} Completed
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((setNum) => {
                    const isDone = completedSets.includes(setNum)
                    const isCurrent = activeSet === setNum && !isDone
                    return (
                      <button
                        key={setNum}
                        type="button"
                        onClick={() => completeSet(setNum)}
                        className={`flex flex-col items-center justify-center p-2.5 border transition-all ${
                          isDone
                            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 font-bold'
                            : isCurrent
                            ? 'border-gold bg-gold text-obsidian font-extrabold shadow-md'
                            : 'border-white/10 bg-surface text-mute hover:border-white/30'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider">Set {setNum}</span>
                        <span className="text-[11px] mt-0.5">
                          {isDone ? '✓ Completed' : isCurrent ? 'Tap to Finish' : '10-12 Reps'}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {isResting && (
                  <div className="mt-3 flex items-center justify-between border border-gold/30 bg-obsidian p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gold animate-ping" />
                      <span className="text-[10px] font-bold text-ink uppercase tracking-wider">
                        Rest Timer: <span className="text-gold text-sm font-mono">{restTimer}s</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRestTimer((t) => t + 30)}
                        className="px-2 py-1 bg-surface-2 border border-white/10 text-[8px] font-bold text-mute hover:text-ink uppercase"
                      >
                        +30s
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsResting(false)}
                        className="px-2 py-1 bg-gold text-obsidian text-[8px] font-bold uppercase"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Execution Protocol & Biomechanics Details */}
            <div className="flex flex-col gap-5 lg:col-span-7">
              {/* Target & Equipment Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-white/10 bg-surface-2 p-3.5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">Target Anatomy</p>
                  <p className="mt-0.5 text-xs font-bold text-ink uppercase truncate">{targetMuscle}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">Equipment</p>
                  <p className="mt-0.5 text-xs font-bold text-ink uppercase truncate">{exercise.equipment || 'Gym'}</p>
                </div>
                {exercise.sets && (
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">Prescription</p>
                    <p className="mt-0.5 text-xs font-bold text-gold uppercase">{exercise.sets} {exercise.reps ? `• ${exercise.reps}` : ''}</p>
                  </div>
                )}
                {exercise.day && (
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">Day & Split</p>
                    <p className="mt-0.5 text-xs font-bold text-ink uppercase truncate">{exercise.day} — {exercise.split_name || 'Standard'}</p>
                  </div>
                )}
              </div>

              {/* Tutorial Title & Description */}
              {exercise.video_description && (
                <div className="border-b border-white/10 pb-4">
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-gold">
                    {exerciseTitle}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-ink/85">
                    {exercise.video_description}
                  </p>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              {Array.isArray(exercise.instructions) && exercise.instructions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-gold" />
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
                      Step-by-Step Execution
                    </h5>
                  </div>
                  <ol className="space-y-2.5">
                    {exercise.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 border border-white/5 bg-surface-2/40 p-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-gold/15 text-gold text-[9px] font-extrabold border border-gold/30">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-ink/90 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Key Form Cues */}
              {Array.isArray(exercise.form_cues) && exercise.form_cues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="h-4 w-4 text-amber-400" />
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
                      Key Form Cues & Biomechanics
                    </h5>
                  </div>
                  <ul className="space-y-2 border border-amber-500/20 bg-amber-500/5 p-3.5">
                    {exercise.form_cues.map((cue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-white/90">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {Array.isArray(exercise.common_mistakes) && exercise.common_mistakes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
                      Common Errors to Avoid
                    </h5>
                  </div>
                  <ul className="space-y-2 border border-rose-500/20 bg-rose-500/5 p-3.5">
                    {exercise.common_mistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-white/90">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Breathing Protocol */}
              {exercise.breathing && (
                <div className="border border-blue-500/20 bg-blue-500/5 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wind className="h-4 w-4 text-blue-400" />
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                      Breathing Cadence
                    </h5>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{exercise.breathing}</p>
                </div>
              )}

              {/* Footer Stamp */}
              <div className="mt-2 border-t border-white/10 pt-3 flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.25em] text-mute">
                <span>X FIT FORMULA — Official Movement Library</span>
                <span>Verified Biomechanics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
