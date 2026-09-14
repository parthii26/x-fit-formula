import { useState, useEffect } from 'react'
import { Play, Dumbbell, Clock, Calendar, Repeat, Image as ImageIcon, Sparkles } from 'lucide-react'
import { DifficultyBadge, EquipmentBadge, CategoryBadge } from './badges.jsx'
import { getOpenSourceDemo } from '../lib/openSourceMedia.js'

export default function ExerciseCard({ exercise, onSelect, index }) {
  const isHomeWorkout = Boolean(exercise?.isHomeWorkout)
  const isGymWorkout = Boolean(exercise?.isGymWorkout)
  const openSourceDemo = getOpenSourceDemo(exercise?.slug || exercise?.name || exercise?.exercise_name)
  const frames = openSourceDemo?.frames || []

  const localSvgFallback = isHomeWorkout
    ? `/media/thumbnails/home-workouts/${exercise?.slug}.svg`
    : `/media/thumbnails/${exercise?.gender || 'male'}/${exercise?.slug}.svg`

  const initialThumb =
    frames[0] ||
    exercise?.thumbnailUrl ||
    exercise?.maleThumbnailUrl ||
    exercise?.femaleThumbnailUrl ||
    localSvgFallback ||
    '/media/thumbnails/male/push-up.svg'

  const [activeFrameIdx, setActiveFrameIdx] = useState(0)
  const [imgFailed, setImgFailed] = useState(false)

  const currentFrameUrl = frames[activeFrameIdx] || (activeFrameIdx === 0 ? initialThumb : (frames[0] || initialThumb))

  const secondaryMusclesText = Array.isArray(exercise?.secondary_muscles) && exercise.secondary_muscles.length > 0
    ? ` • ${exercise.secondary_muscles.slice(0, 2).join(' • ')}`
    : ''

  useEffect(() => {
    setActiveFrameIdx(0)
    setImgFailed(false)
  }, [exercise])

  const handleCardClick = (e) => {
    // Default click opens in image P1/P2 step view or video view
    if (onSelect) onSelect(exercise, 'images')
  }

  const handleOpenImages = (e) => {
    e.stopPropagation()
    if (onSelect) onSelect(exercise, 'images')
  }

  const handleOpenVideo = (e) => {
    e.stopPropagation()
    if (onSelect) onSelect(exercise, 'video')
  }

  const handleFrameSwitch = (e, idx) => {
    e.stopPropagation()
    setActiveFrameIdx(idx)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between border border-white/10 bg-surface text-left transition-all duration-300 hover:border-gold/60 hover:bg-surface-2 active:bg-surface-2 cursor-pointer shadow-md"
    >
      {/* Top Image Media Block */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-obsidian border-b border-white/10 flex items-center justify-center">
        {!imgFailed ? (
          <img
            src={currentFrameUrl}
            alt={exercise.name || exercise.exercise_name}
            loading="lazy"
            onError={() => {
              if (currentFrameUrl !== localSvgFallback && localSvgFallback) {
                setActiveFrameIdx(0)
              } else {
                setImgFailed(true)
              }
            }}
            className="h-full w-full object-contain bg-obsidian object-center transition-transform duration-500 group-hover:scale-105 select-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-gold mb-2">
              <Dumbbell className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-mute">
              {exercise.name || exercise.exercise_name}
            </span>
          </div>
        )}

        {/* Hover / Mobile Action Overlay (Choose between P1/P2 Images or Video) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-obsidian/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 p-3">
          <button
            type="button"
            onClick={handleOpenImages}
            className="w-full flex items-center justify-center gap-2 border border-gold/80 bg-gold px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-obsidian shadow-lg hover:bg-white hover:border-white transition-all transform hover:scale-[1.02]"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>📸 View P1 • P2 Images</span>
          </button>

          <button
            type="button"
            onClick={handleOpenVideo}
            className="w-full flex items-center justify-center gap-2 border border-white/30 bg-surface/90 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-lg hover:border-gold hover:text-gold transition-all transform hover:scale-[1.02]"
          >
            <Play className="h-3.5 w-3.5 fill-current text-gold" />
            <span>🎬 Watch HD Video</span>
          </button>
        </div>

        {/* Category / Level / Step Badge top left */}
        <div className="absolute left-2.5 top-2.5 pointer-events-none flex items-center gap-1.5">
          {typeof index === 'number' && (
            <span className="flex h-5 w-5 items-center justify-center bg-gold text-obsidian text-[10px] font-extrabold shadow-md">
              {index}
            </span>
          )}
          <CategoryBadge category={exercise.category || (isHomeWorkout ? 'Home' : 'Gym')} />
          {exercise.day && (
            <span className="bg-obsidian/90 border border-gold/40 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-gold">
              {exercise.day}
            </span>
          )}
        </div>

        {/* Difficulty / Level Badge top right */}
        <div className="absolute right-2.5 top-2.5 pointer-events-none">
          <DifficultyBadge difficulty={exercise.level || exercise.difficulty || 'Beginner'} />
        </div>

        {/* Interactive P1 / P2 Frame Switcher Pill (Bottom Right of Image) */}
        {frames.length > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-obsidian/90 border border-white/20 p-1 backdrop-blur-md z-10">
            <button
              type="button"
              onClick={(e) => handleFrameSwitch(e, 0)}
              className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider transition-colors ${
                activeFrameIdx === 0
                  ? 'bg-gold text-obsidian font-black'
                  : 'bg-white/10 text-mute hover:text-ink'
              }`}
              title="Phase 1: Starting Position"
            >
              P1
            </button>
            <button
              type="button"
              onClick={(e) => handleFrameSwitch(e, 1)}
              className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider transition-colors ${
                activeFrameIdx === 1
                  ? 'bg-gold text-obsidian font-black'
                  : 'bg-white/10 text-mute hover:text-ink'
              }`}
              title="Phase 2: Peak Contraction"
            >
              P2
            </button>
          </div>
        )}

        {/* Sets & Reps Pill bottom left if Gym Workout */}
        {exercise.sets && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-obsidian/90 px-2 py-0.5 text-[9px] font-bold text-gold backdrop-blur-xs border border-gold/30 pointer-events-none">
            <Repeat className="h-2.5 w-2.5 text-gold" />
            <span>{exercise.sets} {exercise.reps ? `• ${exercise.reps}` : ''}</span>
          </div>
        )}

        {/* Duration tag for home tutorials if available */}
        {exercise.duration && !exercise.sets && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-obsidian/80 px-2 py-0.5 text-[9px] font-bold text-ink backdrop-blur-xs border border-white/10 pointer-events-none">
            <Clock className="h-2.5 w-2.5 text-gold" />
            <span>{exercise.duration}</span>
          </div>
        )}
      </div>

      {/* Card Content Information */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {exercise.split_name && (
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/80 mb-1">
              {exercise.day ? `${exercise.day} — ` : ''}{exercise.split_name}{exercise.section ? ` (${exercise.section})` : ''}
            </p>
          )}

          <h3 className="font-display text-base font-bold uppercase tracking-[0.06em] text-ink transition-colors group-hover:text-gold sm:text-lg">
            {typeof index === 'number' ? `${index}. ` : ''}{exercise.name || exercise.exercise_name}
          </h3>

          <p className="mt-1 text-[11px] font-medium tracking-wide text-white/70 truncate">
            <span className="font-semibold text-gold/90">{exercise.target || exercise.target_muscle}</span>
            <span className="text-white/40">{secondaryMusclesText}</span>
          </p>
        </div>

        {/* Footer Meta Strip with Dual Action Triggers */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 gap-2">
          <EquipmentBadge equipment={exercise.equipment || 'Gym'} />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenImages}
              className="inline-flex items-center gap-1 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider border border-white/15 bg-surface-2 text-mute hover:border-gold hover:text-gold transition-colors"
              title="View P1 & P2 Step Photos"
            >
              <ImageIcon className="h-2.5 w-2.5" />
              <span>P1/P2</span>
            </button>

            <button
              type="button"
              onClick={handleOpenVideo}
              className="inline-flex items-center gap-1 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider border border-gold/40 bg-gold/10 text-gold hover:bg-gold hover:text-obsidian transition-colors"
              title="Watch Video Tutorial"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              <span>Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
