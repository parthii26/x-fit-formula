import { useEffect, useRef, useState } from 'react'
import {
  X, Play, Pause, RotateCcw, ShieldCheck, Dumbbell, Flame, Info,
  CheckCircle2, AlertTriangle, Wind, User, Users, AlertCircle, Clock, Check
} from 'lucide-react'
import { DifficultyBadge, EquipmentBadge, CategoryBadge, MuscleBadge } from './badges.jsx'

export default function ExerciseDetailModal({ exercise, onClose }) {
  const isHomeWorkout = Boolean(exercise?.isHomeWorkout)

  // Check which gender demos exist for gym exercises
  const hasMale = Boolean(exercise?.male_video_path || exercise?.maleVideoUrl)
  const hasFemale = Boolean(exercise?.female_video_path || exercise?.femaleVideoUrl)
  const hasBothGenders = hasMale && hasFemale

  const [gender, setGender] = useState(hasMale ? 'male' : 'female')
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null)
  const [hasTriedFallback, setHasTriedFallback] = useState(false)
  const videoRef = useRef(null)

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

  // Resolve video URL
  useEffect(() => {
    if (!exercise) return

    if (isHomeWorkout) {
      // Home workout tutorial video
      const url = exercise.videoUrl || exercise.video_url
      setCurrentVideoSrc(url || null)
      setVideoError(!url)
      setVideoLoaded(Boolean(url))
      setIsPlaying(false)
    } else {
      // Standard exercise library
      const rawUrl = gender === 'female'
        ? (exercise.femaleVideoUrl || exercise.female_video_path || exercise.maleVideoUrl || exercise.male_video_path)
        : (exercise.maleVideoUrl || exercise.male_video_path || exercise.femaleVideoUrl || exercise.female_video_path)

      const normalizedUrl = rawUrl?.startsWith('http') || rawUrl?.startsWith('/media')
        ? rawUrl
        : rawUrl ? `/media/${rawUrl}` : null

      setCurrentVideoSrc(normalizedUrl)
      setVideoError(!normalizedUrl)
      setVideoLoaded(false)
      setHasTriedFallback(false)
      setIsPlaying(false)
    }

    if (import.meta.env.DEV) {
      console.log('[ExerciseDetailModal] Media Source:', {
        name: exercise.name || exercise.exercise_name,
        isHomeWorkout,
        src: currentVideoSrc,
      })
    }
  }, [gender, exercise, isHomeWorkout])

  if (!exercise) return null

  const exerciseTitle = exercise.video_title || exercise.title || exercise.name || exercise.exercise_name
  const exerciseName = exercise.name || exercise.exercise_name
  const targetMuscle = exercise.target || exercise.target_muscle || 'Full Body'
  const levelOrDifficulty = exercise.level || exercise.difficulty || 'Beginner'

  const thumbnailUrl =
    exercise.thumbnailUrl ||
    (gender === 'female'
      ? (exercise.femaleThumbnailUrl || exercise.female_thumbnail_path || exercise.maleThumbnailUrl)
      : (exercise.maleThumbnailUrl || exercise.male_thumbnail_path || exercise.femaleThumbnailUrl)) ||
    (exercise.slug ? `/media/thumbnails/home-workouts/${exercise.slug}.jpg` : '/media/thumbnails/male/push-up.jpg')

  const normalizedThumbnail = thumbnailUrl?.startsWith('http') || thumbnailUrl?.startsWith('/media')
    ? thumbnailUrl
    : `/media/${thumbnailUrl}`

  const handleVideoError = (e) => {
    if (import.meta.env.DEV) {
      console.warn('[ExerciseDetailModal] Video playback error:', currentVideoSrc, e)
    }
    setVideoError(true)
    setVideoLoaded(false)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const restartVideo = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
    setIsPlaying(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 lg:p-8 animate-fade-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative z-10 flex h-[92dvh] sm:h-auto sm:max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden border border-white/15 bg-surface text-ink shadow-2xl rounded-t-2xl sm:rounded-none">
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
                {isHomeWorkout ? `Home Workout • ${levelOrDifficulty}` : 'Exercise Protocol'}
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
            {/* Left Column: Video & Media Presentation */}
            <div className="flex flex-col gap-3.5 lg:col-span-5">
              {/* Video Player Box */}
              <div className="relative aspect-video sm:aspect-square w-full overflow-hidden border border-white/10 bg-obsidian shadow-inner">
                {currentVideoSrc && !videoError ? (
                  <video
                    ref={videoRef}
                    key={`${exercise.slug}-${gender}-${currentVideoSrc}`}
                    src={currentVideoSrc}
                    poster={normalizedThumbnail}
                    controls
                    playsInline
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedData={() => {
                      setVideoLoaded(true)
                      setVideoError(false)
                    }}
                    onError={handleVideoError}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    {normalizedThumbnail ? (
                      <img
                        src={normalizedThumbnail}
                        alt={exerciseName}
                        className="h-full w-full object-cover opacity-75"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-2">
                        <Dumbbell className="h-16 w-16 text-white/20" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/75 p-5 text-center backdrop-blur-xs">
                      <AlertCircle className="mb-2 h-7 w-7 text-gold/90" strokeWidth={1.5} />
                      <p className="text-xs font-bold uppercase tracking-wider text-ink">
                        {isHomeWorkout ? 'Tutorial Media Pending Upload' : 'Video Unavailable'}
                      </p>
                      <p className="mt-1 text-[10px] text-mute max-w-xs leading-relaxed">
                        {isHomeWorkout
                          ? 'Client video asset will stream here once uploaded to Supabase Storage. Biomechanics and technique cues ready below.'
                          : 'Biomechanics and execution protocol cues available below.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Badges Over Video */}
                <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 pointer-events-none">
                  <CategoryBadge category={exercise.category || (isHomeWorkout ? 'Home' : 'Gym')} />
                  <DifficultyBadge difficulty={levelOrDifficulty} />
                </div>
              </div>

              {/* Gender Switcher Strip (Only for Gym exercises with dual demos) */}
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

              {/* Equipment & Level Quick Info */}
              <div className="border border-white/10 bg-surface-2 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">Equipment</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink">
                      {exercise.equipment || 'Bodyweight'}
                    </p>
                  </div>
                  {exercise.duration && (
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">Duration</p>
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink">
                        {exercise.duration}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-mute">Target Region</p>
                  <p className="mt-0.5 text-xs font-semibold text-white/90 uppercase">{targetMuscle}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Execution Protocol & Biomechanics Details */}
            <div className="flex flex-col gap-5 lg:col-span-7">
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
                  <h4 className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-ink">
                    <CheckCircle2 className="h-4 w-4 text-gold" strokeWidth={1.75} />
                    Step-by-Step Instructions
                  </h4>
                  <ol className="mt-3 space-y-2">
                    {exercise.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink/90">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-gold/40 bg-gold/10 text-[10px] font-bold text-gold">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Key Form Cues */}
              {Array.isArray(exercise.form_cues) && exercise.form_cues.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-ink">
                    <Flame className="h-4 w-4 text-gold" strokeWidth={1.75} />
                    Key Form Cues
                  </h4>
                  <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {exercise.form_cues.map((cue, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 border border-white/10 bg-surface-2 p-2.5 text-xs text-ink/90"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold mt-1.5" />
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes Warning Section */}
              {Array.isArray(exercise.common_mistakes) && exercise.common_mistakes.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-400">
                    <AlertTriangle className="h-4 w-4 text-rose-400" strokeWidth={1.75} />
                    Common Mistakes to Avoid
                  </h4>
                  <div className="mt-2.5 space-y-1.5 border-l-2 border-rose-500/60 bg-rose-500/5 p-3">
                    {exercise.common_mistakes.map((mistake, idx) => (
                      <p key={idx} className="text-xs leading-relaxed text-rose-200/90">
                        • {mistake}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Breathing Guidance */}
              {exercise.breathing && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-400">
                    <Wind className="h-4 w-4 text-sky-400" strokeWidth={1.75} />
                    Breathing Technique
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-mute">
                    {exercise.breathing}
                  </p>
                </div>
              )}

              {/* Source & Attribution Note */}
              <div className="border-t border-white/10 pt-3 text-[9px] text-white/30">
                <p>
                  {isHomeWorkout
                    ? 'X FIT FORMULA — Official Production Home Workout Collection'
                    : `Movement protocol sourced from ${exercise.source_name || 'Free Exercise DB'} (${exercise.metadata_license || 'MIT License'}).`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
