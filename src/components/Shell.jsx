import { LogOut } from 'lucide-react'
import { Avatar } from './ui.jsx'

// ─── Responsive app shell ──────────────────────────────────────────────────
// Mobile: minimal top bar + fixed bottom tab bar.
// Desktop (lg+): fixed left sidebar, hairline-divided.

function Wordmark({ compact }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="X Fit Formula"
        className={`${compact ? 'h-7 w-7 rounded' : 'h-10 w-10 rounded-lg'} object-cover shadow-md ring-1 ring-gold/25`}
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display font-extrabold uppercase leading-none tracking-[0.18em] text-ink ${compact ? 'text-xs' : 'text-sm'}`}>
            X FIT
          </span>
          <span className={`font-display font-medium uppercase leading-none tracking-[0.18em] text-gold ${compact ? 'text-xs' : 'text-sm'}`}>
            FORMULA
          </span>
        </div>
        {!compact && (
          <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-mute">
            Coaching Platform
          </span>
        )}
      </div>
    </div>
  )
}

export default function Shell({ user, roleLabel, nav, active, onNav, onLogout, children }) {
  return (
    <div className="min-h-screen bg-obsidian text-ink">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 bg-obsidian lg:flex">
        <div className="px-8 pb-10 pt-10">
          <Wordmark />
          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.35em] text-mute">{roleLabel}</p>
        </div>

        <nav className="flex-1 px-4">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`group flex w-full items-center gap-4 border-l px-5 py-4 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors
                ${active === item.id
                  ? 'border-gold text-ink'
                  : 'border-transparent text-mute hover:text-ink'}`}
            >
              <item.icon className={`h-[17px] w-[17px] ${active === item.id ? 'text-gold' : 'text-mute group-hover:text-ink'}`} strokeWidth={1.5} />
              {item.label}
              {item.badge ? (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center bg-gold px-1.5 text-[9px] font-bold text-obsidian">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold tracking-wide text-ink">{user.name}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.15em] text-mute">{user.subtitle}</p>
            </div>
            <button onClick={onLogout} title="Sign out" className="p-2 text-mute transition-colors hover:text-gold">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-obsidian/95 px-5 py-4 backdrop-blur-sm lg:hidden">
        <Wordmark compact />
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-mute">{roleLabel}</span>
          <button onClick={onLogout} title="Sign out" className="min-h-[44px] px-1 text-mute transition-colors hover:text-gold">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-6xl px-5 pb-32 pt-8 sm:px-8 lg:ml-72 lg:max-w-none lg:px-14 lg:pb-16 lg:pt-14">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-obsidian/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around overflow-x-auto no-scrollbar px-1">
          {nav.map((item) => {
            const shortLabel = item.label === 'Workout Library' ? 'Library' : item.label
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`relative flex min-h-[58px] min-w-[52px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[8px] font-bold uppercase tracking-[0.15em] transition-colors
                  ${active === item.id ? 'text-ink' : 'text-mute hover:text-ink'}`}
              >
                {active === item.id && <span className="absolute top-0 h-[2px] w-6 bg-gold" />}
                <span className="relative">
                  <item.icon className={`h-4 w-4 ${active === item.id ? 'text-gold' : 'text-mute'}`} strokeWidth={1.75} />
                  {item.badge ? (
                    <span className="absolute -right-2.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center bg-gold px-0.5 text-[8px] font-bold text-obsidian">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                <span className="truncate max-w-[64px]">{shortLabel}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
