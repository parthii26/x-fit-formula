// ─── Shared UI primitives — obsidian / matte / gold system ─────────────────

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-sm border border-white/10 bg-surface p-6 sm:p-8 lg:p-10 ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ kicker, children, className = '' }) {
  return (
    <div className={className}>
      {kicker && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">{kicker}</p>}
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.12em] text-ink sm:text-2xl">{children}</h2>
    </div>
  )
}

export function Label({ children, hint }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-mute">{children}</span>
      {hint && <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">{hint}</span>}
    </div>
  )
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-none border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[15px] text-ink placeholder-white/25 outline-none transition-colors
        focus:border-gold ${props.className || ''}`}
    />
  )
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-none border border-white/10 bg-surface-2 px-4 py-3.5 text-[15px] text-ink placeholder-white/25 outline-none transition-colors
        focus:border-gold/60 ${props.className || ''}`}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none rounded-none border-0 border-b border-white/15 bg-transparent px-0 py-3 pr-8 text-[15px] text-ink outline-none transition-colors focus:border-gold [&>option]:bg-surface [&>option]:text-ink"
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export function UnitToggle({ options, value, onChange }) {
  return (
    <div className="flex shrink-0 border border-white/10">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`min-h-[40px] px-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
            value === opt ? 'bg-ink text-obsidian' : 'text-mute hover:text-ink'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export function Badge({ tone = 'gold', children, className = '' }) {
  const tones = {
    gold: 'border-gold/40 text-gold',
    amber: 'border-amber-500/40 text-amber-400/90',
    red: 'border-red-400/40 text-red-300/90',
    mute: 'border-white/15 text-mute',
    ink: 'border-white/30 text-ink',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function Avatar({ name, size = 'md', className = '' }) {
  const initials = (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const sizes = { sm: 'h-9 w-9 text-[10px]', md: 'h-11 w-11 text-xs', lg: 'h-16 w-16 text-base' }
  return (
    <div className={`flex shrink-0 items-center justify-center border border-white/15 bg-surface-2 font-display font-bold tracking-widest text-gold ${sizes[size]} ${className}`}>
      {initials}
    </div>
  )
}

// Monolithic action button
export function Btn({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-ink text-obsidian hover:bg-gold disabled:bg-surface-2 disabled:text-white/25',
    gold: 'bg-gold text-obsidian hover:bg-ink disabled:bg-surface-2 disabled:text-white/25',
    ghost: 'border border-white/15 bg-transparent text-ink hover:border-gold hover:text-gold disabled:text-white/25 disabled:hover:border-white/15',
    quiet: 'bg-transparent text-mute hover:text-ink',
  }
  return (
    <button
      {...props}
      className={`min-h-[52px] rounded-none px-6 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Oversized minimalist checkbox (gym tracking)
export function BigCheck({ checked, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={label}
      className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors sm:h-14 sm:w-14
        ${checked ? 'border-gold bg-gold' : 'border-white/20 bg-transparent hover:border-white/50'}`}
    >
      {checked && (
        <svg className="h-5 w-5 text-obsidian sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="square" d="M4 12.5l5 5L20 6.5" />
        </svg>
      )}
    </button>
  )
}

export function Divider({ className = '' }) {
  return <div className={`h-px w-full bg-white/10 ${className}`} />
}
