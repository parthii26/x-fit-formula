import { useState, useEffect } from 'react'
import { Play, Dumbbell, Clock } from 'lucide-react'
import { DifficultyBadge, EquipmentBadge, CategoryBadge } from './badges.jsx'
import { getOpenSourceDemo } from '../lib/openSourceMedia.js'

export default function ExerciseCard({ exercise, onSelect }) {
  const isHomeWorkout = Boolean(exercise?.isHomeWorkout)
  const openSourceDemo = getOpenSourceDemo(exercise?.slug)

  const localSvgFallback = isHomeWorkout
    ? `/media/thumbnails/home-workouts/${exercise?.slug}.svg`
    : `/media/thumbnails/${exercise?.gender || 'male'}/${exercise?.slug}.svg`

  const initialThumb =
    openSourceDemo?.frames?.[0] ||
    exercise?.thumbnailUrl ||
    exercise?.maleThumbnailUrl ||
    exercise?.femaleThumbnailUrl ||
    localSvgFallback ||
    '/media/thumbnails/male/push-up.svg'

  const [imgSrc, setImgSrc] = useState(initialThumb)
  const [imgFailed, setImgFailed] = useState(false)

  const secondaryMusclesText = Array.isArray(exercise?.secondary_muscles) && exercise.secondary_muscles.length > 0
    ? ` • ${exercise.secondary_muscles.slice(0, 2).join(' • ')}`
    : ''

  useEffect(() => {
    setImgSrc(initialThumb)
    setImgFailed(false)
  }, [exercise, initialThumb])

  return (
    <div
      onClick={() => onSelect(exercise)}
      className="group relative flex flex-col justify-between border border-white/10 bg-surface text-left transition-all duration-300 hover:border-gold/60 hover:bg-surface-2 active:bg-surface-2 cursor-pointer shadow-md"
    >
      {/* Top Image Media Block */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-obsidian border-b border-white/10 flex items-center justify-center">
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={exercise.name || exercise.exercise_name}
            loading="lazy"
            onError={() => {
              if (imgSrc !== localSvgFallback && localSvgFallback) {
                setImgSrc(localSvgFallback)
              } else {
                setImgFailed(true)
              }
            }}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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

        {/* Hover & Mobile Active Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/80 bg-gold text-obsidian shadow-xl transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-current" strokeWidth={1.5} />
          </div>
        </div>

        {/* Category / Level Badge top left */}
        <div className="absolute left-2.5 top-2.5 pointer-events-none">
          <CategoryBadge category={exercise.category || (isHomeWorkout ? 'Home' : 'Gym')} />
        </div>

        {/* Difficulty / Level Badge top right */}
        <div className="absolute right-2.5 top-2.5 pointer-events-none">
          <DifficultyBadge difficulty={exercise.level || exercise.difficulty || 'Beginner'} />
        </div>

        {/* Duration tag for tutorials if available */}
        {exercise.duration && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-obsidian/80 px-2 py-0.5 text-[9px] font-bold text-ink backdrop-blur-xs border border-white/10 pointer-events-none">
            <Clock className="h-2.5 w-2.5 text-gold" />
            <span>{exercise.duration}</span>
          </div>
        )}
      </div>

      {/* Card Content Information */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="font-display text-base font-bold uppercase tracking-[0.06em] text-ink transition-colors group-hover:text-gold sm:text-lg">
            {exercise.name || exercise.exercise_name}
          </h3>

          <p className="mt-1 text-[11px] font-medium tracking-wide text-white/70 truncate">
            <span className="font-semibold text-gold/90">{exercise.target || exercise.target_muscle}</span>
            <span className="text-white/40">{secondaryMusclesText}</span>
          </p>
        </div>

        {/* Footer Meta Strip */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <EquipmentBadge equipment={exercise.equipment || 'Bodyweight'} />

          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-gold group-hover:translate-x-0.5 transition-transform">
            ▶ Watch Tutorial
          </span>
        </div>
      </div>
    </div>
  )
}
