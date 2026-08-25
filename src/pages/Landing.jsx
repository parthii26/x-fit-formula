import { useState } from 'react'
import { ArrowRight, ArrowLeft, Sparkles, User, Dumbbell, ShieldCheck } from 'lucide-react'
import { Label, TextInput, Btn, Divider } from '../components/ui.jsx'
import ExerciseLibrary from './ExerciseLibrary.jsx'
import HeroSlider from '../components/HeroSlider.jsx'

export default function Landing({ onLogin, demoClients, authError, authLoading }) {
  const [portal, setPortal] = useState(null) // null | 'client' | 'trainer' | 'library'

  return (
    <div className="flex min-h-screen flex-col bg-obsidian text-ink">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-obsidian/95 px-4 py-3.5 backdrop-blur-md sm:px-8 lg:px-12">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/logo.png"
            alt="X Fit Formula"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-md object-cover shadow-sm ring-1 ring-gold/30 shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-display text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-ink">
              X FIT FORMULA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setPortal('library')}
            className="flex items-center gap-1.5 border border-white/15 bg-surface/60 px-3 py-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-obsidian active:scale-95"
            aria-label="Open Workout Library"
          >
            <Dumbbell className="h-3 w-3 sm:hidden" />
            <span className="hidden sm:inline">Workout Library</span>
            <span className="sm:hidden">Library</span>
          </button>
          <span className="hidden md:inline text-[9px] font-semibold uppercase tracking-[0.35em] text-mute">
            EST. MMXXVI
          </span>
        </div>
      </header>

      {!portal ? (
        <main className="flex flex-1 flex-col">
          {/* Luxury 4-Scene Campaign Hero Slider */}
          <HeroSlider
            onSelectPortal={(p) => setPortal(p)}
            onOpenLibrary={() => setPortal('library')}
          />

          {/* Monolithic Portal Entrance Cards */}
          <section className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-2">
            <button
              onClick={() => setPortal('client')}
              className="group flex min-h-[110px] sm:min-h-[130px] items-center justify-between border-b border-white/10 px-6 py-8 sm:py-10 text-left transition-colors hover:bg-surface sm:border-b-0 sm:border-r sm:px-10 lg:px-12 active:bg-surface-2"
              aria-label="Access Client Portal"
            >
              <div>
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.35em] text-mute">01</p>
                <p className="font-display text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors group-hover:text-gold">
                  Client Portal
                </p>
                <p className="mt-1 text-xs text-mute max-w-sm">
                  Access daily programming, workout logging, progression metrics & direct coach check-ins.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-mute transition-all group-hover:translate-x-2 group-hover:text-gold" strokeWidth={1.5} />
            </button>

            <button
              onClick={() => setPortal('trainer')}
              className="group flex min-h-[110px] sm:min-h-[130px] items-center justify-between px-6 py-8 sm:py-10 text-left transition-colors hover:bg-surface sm:px-10 lg:px-12 active:bg-surface-2"
              aria-label="Access Trainer Portal"
            >
              <div>
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.35em] text-mute">02</p>
                <p className="font-display text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors group-hover:text-gold sm:text-2xl">
                  Trainer Access
                </p>
                <p className="mt-1 text-xs text-mute max-w-sm">
                  Review athlete roster, build periodized programs & analyze client biometrics in real time.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-mute transition-all group-hover:translate-x-2 group-hover:text-gold" strokeWidth={1.5} />
            </button>
          </section>
        </main>
      ) : portal === 'library' ? (
        <ExerciseLibrary onBack={() => setPortal(null)} embedded={false} />
      ) : (
        <AuthPanel portal={portal} onBack={() => setPortal(null)} onLogin={onLogin} demoClients={demoClients} authError={authError} authLoading={authLoading} />
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-5 text-center sm:px-12">
        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white/30">
          X Fit Formula — Precision Coaching Platform — MMXXVI
        </p>
      </footer>
    </div>
  )
}

// ─── Authentication Panel ──────────────────────────────────────────────────

function AuthPanel({ portal, onBack, onLogin, demoClients, authError, authLoading }) {
  const isClient = portal === 'client'
  const [mode, setMode] = useState(isClient ? 'signup' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const canSubmit = mode === 'signup' ? name.trim() && email.trim() && password : email.trim() && password

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onLogin({ portal, mode, name: name.trim(), email: email.trim(), password })
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-8 flex min-h-[44px] items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-mute transition-colors hover:text-gold"
          aria-label="Return to homepage"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Return
        </button>

        <div className="animate-fade-up">
          <div className="mb-3 flex items-center gap-3">
            <img src="/logo.png" alt="X Fit Formula" className="h-8 w-8 rounded-md object-cover shadow ring-1 ring-gold/30" />
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.35em] text-gold">
              {isClient ? '01 — Client Portal' : '02 — Trainer Portal'}
            </p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.12em]">
            {mode === 'login' ? 'Authenticate' : 'Start Your Journey'}
          </h2>
          <p className="mt-1 text-xs text-mute">
            {isClient
              ? mode === 'signup'
                ? 'Create your profile to calculate your biometrics and receive your custom program.'
                : 'Access your active workout protocol and coach messaging.'
              : 'Sign in to access your coaching command center.'}
          </p>

          {/* Mode switch */}
          <div className="mt-8 flex border border-white/10">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`min-h-[48px] flex-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors
                  ${mode === m ? 'bg-ink text-obsidian' : 'text-mute hover:text-ink'}`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 space-y-6 sm:space-y-7">
            {mode === 'signup' && (
              <div>
                <Label>Full Name</Label>
                <TextInput
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <TextInput
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <TextInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Auth error */}
            {authError && (
              <p className="rounded-none border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] font-semibold text-red-400">
                {authError}
              </p>
            )}
            <Btn
              type="submit"
              variant="gold"
              disabled={!canSubmit || authLoading}
              className="w-full min-h-[50px] text-[11px] uppercase tracking-[0.25em]"
            >
              {authLoading ? 'Authenticating…' : mode === 'signup' ? 'START YOUR JOURNEY' : 'ENTER PORTAL'}
            </Btn>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
              Instant Demo Access
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isClient ? (
                <>
                  {(demoClients || []).slice(0, 2).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onLogin({ portal: 'client', mode: 'demo', clientId: c.id })}
                      className="border border-white/15 bg-surface-2 px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-ink transition-colors hover:border-gold hover:text-gold"
                    >
                      Demo: {c.profile.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onLogin({ portal: 'client', mode: 'demo-new', name: 'Devon Vance' })}
                    className="border border-gold/30 bg-gold/10 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-obsidian"
                  >
                    + New Assessment Demo
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onLogin({ portal: 'trainer', mode: 'login' })}
                  className="border border-gold/40 bg-gold/10 px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-obsidian"
                >
                  Trainer Demo (Coach Vance)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
