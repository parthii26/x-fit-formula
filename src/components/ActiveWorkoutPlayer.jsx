import { useEffect, useRef, useState } from 'react'
import {
  X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Check,
  CheckCircle2, Flame, Timer, Volume2, VolumeX, AlertCircle, Dumbbell, Award, Activity, Film
} from 'lucide-react'
import { fetchExerciseById } from '../lib/supabase.js'
import { CategoryBadge, DifficultyBadge } from './badges.jsx'
import { getOpenSourceDemo, getYouTubeEmbedUrl } from '../lib/openSourceMedia.js'

export default function ActiveWorkoutPlayer({
  plan,
  client,
  onCompleteSession,
  onClose,
}) {
  const exercises = plan?.exercises || []
  const [currentIdx, setCurrentIdx] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [completedSets, setCompletedSets] = useState({})
  const [gender, setGender] = useState('male')
  const [exerciseData, setExerciseData] = useState(null)
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [videoSrc, setVideoSrc] = useState(null)
  const [videoError, setVideoError] = useState(false)
  const [activeFrameIndex, setActiveFrameIndex] = useState(0)
  const [viewMode, setViewMode] = useState('video')

  // Timer state
  const [restTimer, setRestTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Completion summary modal
  const [isFinished, setIsFinished] = useState(false)

  const currentEx = exercises[currentIdx] || {}
  const totalExercises = exercises.length
  const totalSets = Math.max(1, parseInt(String(currentEx.sets || '3').match(/\d+/)?.[0] || '3', 10))

  // Fetch full exercise metadata when exercise changes
  useEffect(() => {
    let isMounted = true
    if (!currentEx.name) return

    setLoadingMedia(true)
    setVideoError(false)

    fetchExerciseById(currentEx.name).then((data) => {
      if (isMounted && data) {
        setExerciseData(data)
        const rawUrl = gender === 'female'
          ? (data.femaleVideoUrl || data.female_video_path || data.maleVideoUrl || data.male_video_path)
          : (data.maleVideoUrl || data.male_video_path || data.femaleVideoUrl || data.female_video_path)

        const normalized = rawUrl?.endsWith('.mp4') ? rawUrl : null
        setVideoSrc(normalized)
        setLoadingMedia(false)
      }
    }).catch(() => {
      if (isMounted) setLoadingMedia(false)
    })

    return () => { isMounted = false }
  }, [currentEx.name, gender])

  const openSourceDemo = getOpenSourceDemo(currentEx.slug || exerciseData?.slug || currentEx.name)
  const youtubeUrl = openSourceDemo?.videoUrl || exerciseData?.video_url || exerciseData?.videoUrl || null
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl)

  // Reset viewMode when exercise changes
  useEffect(() => {
    if (embedUrl) {
      setViewMode('video')
    } else if (openSourceDemo?.frames?.length) {
      setViewMode('motion')
    }
  }, [currentEx.name, embedUrl, openSourceDemo])

  // Automated frame loop in active workout player
  useEffect(() => {
    if (!openSourceDemo?.frames?.length) return
    const interval = setInterval(() => {
      setActiveFrameIndex((prev) => (prev + 1) % openSourceDemo.frames.length)
    }, 1250)
    return () => clearInterval(interval)
  }, [openSourceDemo])

  // Rest Timer countdown
  useEffect(() => {
    let interval = null
    if (timerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            if (soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
              try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.frequency.setValueAtTime(880, ctx.currentTime)
                gain.gain.setValueAtTime(0.15, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
                osc.start()
                osc.stop(ctx.currentTime + 0.3)
              } catch { /* ignore audio failure */ }
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [timerRunning, restTimer, soundEnabled])

  const startRestTimer = (seconds = 60) => {
    setRestTimer(seconds)
    setTimerRunning(true)
  }

  const addRestTime = (seconds = 30) => {
    setRestTimer((prev) => prev + seconds)
    if (!timerRunning) setTimerRunning(true)
  }

  const handleCompleteSet = () => {
    const currentCompleted = (completedSets[currentIdx] || 0) + 1
    setCompletedSets((prev) => ({ ...prev, [currentIdx]: currentCompleted }))

    if (currentSet < totalSets) {
      setCurrentSet((s) => s + 1)
      startRestTimer(parseInt(currentEx.rest_seconds || '60', 10) || 60)
    } else {
      if (currentIdx < totalExercises - 1) {
        setCurrentIdx((i) => i + 1)
        setCurrentSet(1)
        startRestTimer(90)
      } else {
        setIsFinished(true)
      }
    }
  }

  const handleNextExercise = () => {
    if (currentIdx < totalExercises - 1) {
      setCurrentIdx((i) => i + 1)
      setCurrentSet(1)
      setTimerRunning(false)
    } else {
      setIsFinished(true)
    }
  }

  const handlePrevExercise = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1)
      setCurrentSet(1)
      setTimerRunning(false)
    }
  }

  const handleFinishAndSave = () => {
    if (onCompleteSession) {
      onCompleteSession(plan.day)
    }
    onClose()
  }

  const handleVideoError = () => {
    if (videoSrc?.startsWith('http')) {
      const relPath = gender === 'female'
        ? (exerciseData?.female_video_path || exerciseData?.male_video_path)
        : (exerciseData?.male_video_path || exerciseData?.female_video_path)
      if (relPath) {
        setVideoSrc(`/media/${relPath}`)
        return
      }
    }
    setVideoError(true)
  }

  const thumbnailUrl = exerciseData
    ? (gender === 'female'
        ? (exerciseData.femaleThumbnailUrl || exerciseData.female_thumbnail_path || exerciseData.maleThumbnailUrl)
        : (exerciseData.maleThumbnailUrl || exerciseData.male_thumbnail_path || exerciseData.femaleThumbnailUrl))
    : null

  const normalizedThumbnail = thumbnailUrl?.startsWith('http') || thumbnailUrl?.startsWith('/media')
    ? thumbnailUrl
    : `/media/${thumbnailUrl}`

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const progressPct = Math.round(((currentIdx + (currentSet - 1) / totalSets) / totalExercises) * 100)

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/95 p-5 backdrop-blur-md animate-fade-up">
        <div className="w-full max-w-md border border-gold/40 bg-surface p-8 text-center sm:p-10 shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10 text-gold shadow-lg shadow-gold/10">
            <Award className="h-10 w-10 animate-bounce" strokeWidth={1.5} />
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            Workout Complete
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-wide text-ink sm:text-4xl">
            Protocol Executed
          </h2>
          <p className="mt-3 text-xs text-mute leading-relaxed">
            All {totalExercises} movements in <span className="text-ink font-semibold">{plan.day} ({plan.focus})</span> completed with full volume compliance.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 border-y border-white/10 py-5">
            <div>
              <p className="font-display text-2xl font-bold text-ink">{totalExercises}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-wider text-mute">Movements</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-gold">100%</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-wider text-mute">Compliance</p>
            </div>
          </div>

          <button
            onClick={handleFinishAndSave}
            className="mt-8 flex min-h-[54px] w-full items-center justify-center gap-2 bg-gold text-obsidian text-xs font-bold uppercase tracking-[0.25em] transition-all hover:bg-ink active:scale-98"
          >
            <Check className="h-4 w-4 stroke-[3]" /> Save Session & Return
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-obsidian text-ink overflow-hidden safe-area-inset">
      {/* ── Top App Bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-obsidian/95 px-4 sm:px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gold/10 text-gold text-[10px] font-bold">
            {currentIdx + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
              {plan.focus}
            </p>
            <p className="truncate text-xs font-bold text-ink">
              Movement {currentIdx + 1} of {totalExercises}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className="flex h-10 w-10 items-center justify-center border border-white/10 text-mute hover:text-gold"
            title={soundEnabled ? 'Timer Sound On' : 'Timer Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center border border-white/10 text-mute hover:border-red-400 hover:text-red-400"
            title="Leave Workout"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="h-1 w-full bg-white/10">
        <div
          className="h-full bg-gold transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Main Scrollable Interaction Area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-ink">
              {currentEx.name}
            </h1>
            <p className="mt-1 text-xs uppercase tracking-wider text-mute">
                Target: <span className="font-bold text-gold">{exerciseData?.target || 'Primary Muscle'}</span>
              {exerciseData?.equipment ? ` • ${exerciseData.equipment}` : ''}
            </p>
          </div>

          {exerciseData?.femaleVideoUrl && (
            <div className="flex shrink-0 border border-white/10">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                  gender === 'male' ? 'bg-gold text-obsidian' : 'text-mute'
                }`}
              >
                M
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                  gender === 'female' ? 'bg-gold text-obsidian' : 'text-mute'
                }`}
              >
                F
              </button>
            </div>
          )}
        </div>

        {/* Media View Mode Switcher */}
        {embedUrl && openSourceDemo?.frames?.length > 0 && !videoSrc && (
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

        {/* Video / Media Display */}
        <div className="relative aspect-video w-full overflow-hidden border border-white/15 bg-obsidian shadow-inner flex items-center justify-center">
          {videoSrc && !videoError ? (
            <video
              key={`${currentEx.name}-${gender}-${videoSrc}`}
              src={videoSrc}
              poster={normalizedThumbnail}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={handleVideoError}
              className="h-full w-full object-contain bg-obsidian"
            />
          ) : viewMode === 'video' && embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${currentEx.name} Video Tutorial`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : openSourceDemo?.frames?.length ? (
            <div className="relative h-full w-full bg-obsidian flex items-center justify-center">
              <img
                src={openSourceDemo.frames[activeFrameIndex] || openSourceDemo.frames[0]}
                alt={currentEx.name}
                className="h-full w-full object-contain bg-obsidian transition-opacity duration-300 select-none"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-obsidian/85 px-2 py-0.5 border border-white/15 backdrop-blur-md">
                <span className={`h-1.5 w-1.5 rounded-full ${activeFrameIndex === 0 ? 'bg-amber-400' : 'bg-gold animate-pulse'}`} />
                <span className="text-[8px] font-bold uppercase tracking-wider text-ink font-mono">
                  {activeFrameIndex === 0 ? 'P1: Stance' : 'P2: Peak'}
                </span>
              </div>
            </div>
          ) : normalizedThumbnail ? (
            <img
              src={normalizedThumbnail}
              alt={currentEx.name}
              className="h-full w-full object-contain bg-obsidian transition-opacity duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-obsidian">
              <Dumbbell className="h-12 w-12 text-white/20" />
            </div>
          )}

          <div className="absolute left-3 top-3 flex gap-1.5 pointer-events-none">
            <CategoryBadge category={exerciseData?.category || 'Gym'} />
            <DifficultyBadge difficulty={exerciseData?.difficulty || 'Beginner'} />
          </div>
        </div>

        {/* Set & Rep Matrix */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-white/15 bg-surface p-3.5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute">Set Progress</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">
              <span className="text-gold">{currentSet}</span> / {totalSets}
            </p>
          </div>

          <div className="border border-white/15 bg-surface p-3.5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute">Target Reps</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">
              {currentEx.reps || '10-12'}
            </p>
          </div>

          <div className={`col-span-2 border p-3.5 transition-colors sm:col-span-2 ${
            restTimer > 0 && timerRunning ? 'border-gold bg-gold/10' : 'border-white/15 bg-surface'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className={`h-4 w-4 ${restTimer > 0 && timerRunning ? 'text-gold animate-spin' : 'text-mute'}`} />
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
                  {restTimer > 0 && timerRunning ? 'Rest Interval' : 'Rest Timer'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => addRestTime(30)}
                  className="border border-white/15 bg-surface-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink hover:border-gold hover:text-gold"
                >
                  +30s
                </button>
                {restTimer > 0 && (
                  <button
                    type="button"
                    onClick={() => { setRestTimer(0); setTimerRunning(false) }}
                    className="border border-white/15 bg-surface-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mute hover:text-ink"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>

            <div className="mt-1.5 flex items-baseline justify-between">
              <p className={`font-display text-2xl font-extrabold tracking-wider ${
                restTimer > 0 && timerRunning ? 'text-gold' : 'text-ink'
              }`}>
                {formatTime(restTimer)}
              </p>
              <span className="text-[10px] text-mute">
                {currentEx.rest_seconds ? `${currentEx.rest_seconds}s programmed` : '60s standard'}
              </span>
            </div>
          </div>
        </div>

        {exerciseData?.form_cues && exerciseData.form_cues.length > 0 && (
          <div className="border border-white/10 bg-surface/60 p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <Flame className="h-3.5 w-3.5" /> Biomechanics Cue
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink/90">
              {exerciseData.form_cues[0]}
            </p>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Touch Controls Bar ── */}
      <footer className="shrink-0 border-t border-white/15 bg-surface p-4 safe-area-bottom">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={handlePrevExercise}
            disabled={currentIdx === 0}
            className="flex h-14 min-w-[54px] items-center justify-center border border-white/15 text-mute transition-colors hover:border-gold hover:text-gold disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous Exercise"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={handleCompleteSet}
            className="flex h-14 flex-1 items-center justify-center gap-2.5 bg-gold text-obsidian font-display text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-ink active:scale-98 shadow-lg shadow-gold/15"
          >
            <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            <span>
              {currentSet < totalSets
                ? `Log Set ${currentSet} of ${totalSets}`
                : currentIdx < totalExercises - 1
                ? 'Finish Exercise & Next'
                : 'Complete Workout'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextExercise}
            className="flex h-14 min-w-[54px] items-center justify-center border border-white/15 text-mute transition-colors hover:border-gold hover:text-gold"
            aria-label="Skip to Next Exercise"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </footer>
    </div>
  )
}
