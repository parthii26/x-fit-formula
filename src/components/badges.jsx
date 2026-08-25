// ─── X FIT FORMULA — Movement Badge System ──────────────────────────────────

export function DifficultyBadge({ difficulty, className = '' }) {
  const tones = {
    Beginner: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    Intermediate: 'border-gold/40 bg-gold/10 text-gold',
    Advanced: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
  }
  const toneClass = tones[difficulty] || 'border-white/20 bg-white/5 text-mute'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] rounded-none border ${toneClass} ${className}`}>
      {difficulty}
    </span>
  )
}

export function EquipmentBadge({ equipment, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] border border-white/10 bg-surface-2 text-mute ${className}`}>
      {equipment}
    </span>
  )
}

export function CategoryBadge({ category, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] border border-white/10 bg-surface-2 text-ink ${className}`}>
      {category}
    </span>
  )
}

export function MuscleBadge({ primary, muscle, className = '' }) {
  if (primary) {
    return (
      <span className={`inline-flex items-center bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-obsidian ${className}`}>
        {muscle}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center border border-white/10 bg-surface-2 px-2.5 py-1 text-[10px] uppercase tracking-wide text-mute ${className}`}>
      {muscle}
    </span>
  )
}
