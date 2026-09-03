import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft, Sparkles, User, Dumbbell, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Label, TextInput, Btn, Divider } from '../components/ui.jsx'
import ExerciseLibrary from './ExerciseLibrary.jsx'
import HeroSlider from '../components/HeroSlider.jsx'

export default function Landing({ onLogin, authError, authLoading }) {
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
        <AuthPanel portal={portal} onBack={() => setPortal(null)} onLogin={onLogin} authError={authError} authLoading={authLoading} />
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

// ─── Authentication Panel (Production Email Suite) ──────────────────────────

function AuthPanel({ portal, onBack, onLogin, authError, authLoading }) {
  const isClient = portal === 'client'
  const [mode, setMode] = useState(isClient ? 'signup' : 'login') // 'login' | 'signup' | 'forgot'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [signupNotice, setSignupNotice] = useState(null)
  const [localError, setLocalError] = useState(null)

  const clearErrors = () => {
    setLocalError(null)
    setSignupNotice(null)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    clearErrors()

    if (mode === 'forgot') {
      if (!email.trim()) {
        setLocalError('Please enter your registered email address.')
        return
      }
      await onLogin({ portal, mode: 'forgot', email: email.trim() })
      setResetSent(true)
      return
    }

    if (mode === 'signup' && !name.trim()) {
      setLocalError('Please enter your full name.')
      return
    }

    if (!email.trim() || !password) {
      setLocalError('Please fill in all required fields.')
      return
    }

    const res = await onLogin({ portal, mode, name: name.trim(), email: email.trim(), password })
    if (res?.emailConfirmationRequired) {
      setSignupNotice(`Account created! A confirmation link has been sent to ${email.trim()}. Please check your email inbox to verify your account and sign in.`)
    }
  }

  const displayedError = localError || authError

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
            {mode === 'forgot'
              ? 'Reset Password'
              : mode === 'login'
              ? 'Authenticate'
              : 'Start Your Journey'}
          </h2>
          <p className="mt-1 text-xs text-mute">
            {mode === 'forgot'
              ? 'Enter your registered email and we will send you a secure link to recover your credentials.'
              : isClient
              ? mode === 'signup'
                ? 'Create your profile to calculate your biometrics and receive your custom program.'
                : 'Access your active workout protocol and coach messaging.'
              : 'Sign in to access your coaching command center.'}
          </p>

          {/* Mode Switcher (Log In vs Sign Up) */}
          {mode !== 'forgot' && (
            <div className="mt-8 flex border border-white/10">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); clearErrors() }}
                  className={`min-h-[46px] flex-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors
                    ${mode === m ? 'bg-ink text-obsidian font-bold' : 'text-mute hover:text-ink'}`}
                >
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* ─── AUTHENTICATION FORM ─── */}
          <form onSubmit={handleFormSubmit} className="mt-7 space-y-5">
            {mode === 'signup' && (
              <div>
                <Label>Full Name</Label>
                <TextInput
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearErrors() }}
                  required
                />
              </div>
            )}

            <div>
              <Label>Email Address</Label>
              <TextInput
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors() }}
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setResetSent(false); clearErrors() }}
                      className="text-[9px] font-semibold uppercase tracking-wider text-gold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <TextInput
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearErrors() }}
                    required
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-mute hover:text-ink transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {signupNotice && (
              <div className="border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 leading-relaxed">
                <p className="font-bold uppercase tracking-wider mb-1">Account Created</p>
                <p>{signupNotice}</p>
              </div>
            )}

            {resetSent && mode === 'forgot' && (
              <div className="border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400">
                ✓ Recovery instructions sent! Please check your inbox and click the reset link.
              </div>
            )}

            {displayedError && (
              <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] font-semibold text-red-400">
                {displayedError}
              </p>
            )}

            <Btn
              type="submit"
              variant="gold"
              disabled={authLoading}
              className="w-full min-h-[50px] text-[11px] uppercase tracking-[0.25em]"
            >
              {authLoading
                ? 'Authenticating…'
                : mode === 'forgot'
                ? 'SEND RESET LINK'
                : mode === 'signup'
                ? 'START YOUR JOURNEY'
                : 'ENTER PORTAL'}
            </Btn>

            {mode !== 'forgot' && (
              <>
                <div className="relative my-2 flex items-center justify-center pt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative bg-obsidian px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-mute">
                    Or Continue With
                  </span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    clearErrors()
                    await onLogin({ portal, mode, provider: 'google' })
                  }}
                  disabled={authLoading}
                  className="flex min-h-[46px] w-full items-center justify-center gap-3 border border-white/15 bg-surface/80 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-ink transition-all hover:border-gold/60 hover:bg-surface active:scale-98"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setResetSent(false); clearErrors() }}
                className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-mute hover:text-gold transition-colors pt-2"
              >
                ← Back to Log In
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
