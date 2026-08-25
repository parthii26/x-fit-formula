import { useState } from 'react'
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

export const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced']
export const CATEGORY_OPTIONS = ['All', 'Home', 'Gym']
export const BODY_PART_OPTIONS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
export const EQUIPMENT_OPTIONS = ['All', 'Bodyweight', 'Barbell', 'Cable', 'Machine', 'Dumbbells']

export default function ExerciseFilters({
  difficulty,
  setDifficulty,
  category,
  setCategory,
  bodyPart,
  setBodyPart,
  equipment,
  setEquipment,
  onReset,
  hasActiveFilters,
}) {
  const [isOpenMobile, setIsOpenMobile] = useState(false)

  // Active filter count
  const activeCount = [
    difficulty !== 'All',
    category !== 'All',
    bodyPart !== 'All',
    equipment !== 'All',
  ].filter(Boolean).length

  return (
    <div className="border border-white/10 bg-surface/60 p-3.5 sm:p-5">
      {/* ── Filter Bar Header (Mobile Toggle + Clear) ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpenMobile((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <Filter className="h-4 w-4 text-gold" strokeWidth={1.75} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink">
            Filter Matrix
          </span>
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[8px] font-bold text-obsidian">
              {activeCount}
            </span>
          )}
          <span className="sm:hidden text-mute">
            {isOpenMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 min-h-[36px] px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gold transition-colors hover:text-white active:scale-95"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.75} /> Clear All
          </button>
        )}
      </div>

      {/* ── Quick Mobile Horizontal Pills (Visible when collapsed on mobile) ── */}
      <div className={`mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:hidden ${isOpenMobile ? 'hidden' : 'flex'}`}>
        {CATEGORY_OPTIONS.slice(1).map((opt) => (
          <button
            key={`quick-cat-${opt}`}
            type="button"
            onClick={() => setCategory(category === opt ? 'All' : opt)}
            className={`shrink-0 min-h-[38px] px-3 text-[9px] font-bold uppercase tracking-wider border transition-all ${
              category === opt
                ? 'border-gold bg-gold text-obsidian'
                : 'border-white/10 bg-surface-2 text-mute'
            }`}
          >
            {opt}
          </button>
        ))}
        {BODY_PART_OPTIONS.slice(1).map((opt) => (
          <button
            key={`quick-body-${opt}`}
            type="button"
            onClick={() => setBodyPart(bodyPart === opt ? 'All' : opt)}
            className={`shrink-0 min-h-[38px] px-3 text-[9px] font-bold uppercase tracking-wider border transition-all ${
              bodyPart === opt
                ? 'border-gold bg-gold text-obsidian'
                : 'border-white/10 bg-surface-2 text-mute'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* ── Full Filter Groups Grid (Collapsible on Mobile, always open on Tablet/Desktop) ── */}
      <div className={`mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-4 ${
        isOpenMobile ? 'block' : 'hidden sm:grid'
      }`}>
        {/* Difficulty */}
        <div>
          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
            Difficulty
          </label>
          <div className="flex flex-wrap gap-1">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDifficulty(opt)}
                className={`min-h-[38px] sm:min-h-[32px] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider transition-all ${
                  difficulty === opt
                    ? 'border border-gold bg-gold text-obsidian font-bold'
                    : 'border border-white/10 bg-surface-2 text-mute hover:border-white/25 hover:text-ink'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
            Category
          </label>
          <div className="flex flex-wrap gap-1">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCategory(opt)}
                className={`min-h-[38px] sm:min-h-[32px] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider transition-all ${
                  category === opt
                    ? 'border border-gold bg-gold text-obsidian font-bold'
                    : 'border border-white/10 bg-surface-2 text-mute hover:border-white/25 hover:text-ink'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Body Part */}
        <div>
          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
            Body Part
          </label>
          <div className="flex flex-wrap gap-1">
            {BODY_PART_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setBodyPart(opt)}
                className={`min-h-[38px] sm:min-h-[32px] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider transition-all ${
                  bodyPart === opt
                    ? 'border border-gold bg-gold text-obsidian font-bold'
                    : 'border border-white/10 bg-surface-2 text-mute hover:border-white/25 hover:text-ink'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
            Equipment
          </label>
          <div className="flex flex-wrap gap-1">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setEquipment(opt)}
                className={`min-h-[38px] sm:min-h-[32px] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider transition-all ${
                  equipment === opt
                    ? 'border border-gold bg-gold text-obsidian font-bold'
                    : 'border border-white/10 bg-surface-2 text-mute hover:border-white/25 hover:text-ink'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
