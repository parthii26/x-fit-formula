import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft, Sparkles, User, Dumbbell, ShieldCheck } from 'lucide-react'
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

// ─── Authentication Panel (Production Suite) ───────────────────────────────

function AuthPanel({ portal, onBack, onLogin, authError, authLoading }) {
  const isClient = portal === 'client'
  const [authMethod, setAuthMethod] = useState('email') // 'email' | 'phone'
  const [mode, setMode] = useState(isClient ? 'signup' : 'login') // 'login' | 'signup' | 'forgot'
  
  // Email fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [localError, setLocalError] = useState(null)

  // Phone OTP fields
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [otpStep, setOtpStep] = useState('phone') // 'phone' | 'verify'
  const [resendTimer, setResendTimer] = useState(0)

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [resendTimer])

  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`

  const clearErrors = () => {
    setLocalError(null)
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    clearErrors()

    if (mode === 'forgot') {
      if (!email.trim()) {
        setLocalError('Please enter your registered email address.')
        return
      }
      onLogin({ portal, mode: 'forgot', email: email.trim() })
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

    onLogin({ portal, mode, name: name.trim(), email: email.trim(), password })
  }

  const handleGoogleAuth = () => {
    clearErrors()
    onLogin({ portal, mode: 'google' })
  }

  const handleSendOtp = (e) => {
    e.preventDefault()
    clearErrors()
    const cleanNum = phoneNumber.replace(/\D/g, '')
    if (cleanNum.length < 8) {
      setLocalError('Please enter a valid mobile number.')
      return
    }
    onLogin({ portal, mode: 'phone-otp-send', phone: fullPhone, name: name.trim() })
    setOtpStep('verify')
    setResendTimer(30)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    clearErrors()
    if (otpToken.trim().length < 6) {
      setLocalError('Please enter the 6-digit verification code.')
      return
    }
    onLogin({ portal, mode: 'phone-otp-verify', phone: fullPhone, token: otpToken.trim() })
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

          {/* Social / Google OAuth Button */}
          {mode !== 'forgot' && (
            <div className="mt-8">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="flex min-h-[48px] w-full items-center justify-center gap-3 border border-white/20 bg-surface px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink shadow-sm transition-all hover:border-white/40 hover:bg-surface-2 active:scale-[0.99]"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-obsidian px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-mute">
                  Or Continue With
                </span>
              </div>
            </div>
          )}

          {/* Authentication Method Selector (Email vs Mobile OTP) */}
          {mode !== 'forgot' && (
            <div className="mb-6 flex border border-white/10 bg-surface">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setOtpStep('phone'); clearErrors() }}
                className={`min-h-[42px] flex-1 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  authMethod === 'email' ? 'bg-gold text-obsidian font-extrabold' : 'text-mute hover:text-ink'
                }`}
              >
                ✉ Email & Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setOtpStep('phone'); clearErrors() }}
                className={`min-h-[42px] flex-1 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  authMethod === 'phone' ? 'bg-gold text-obsidian font-extrabold' : 'text-mute hover:text-ink'
                }`}
              >
                📱 Mobile OTP
              </button>
            </div>
          )}

          {/* Log In / Sign Up Mode Switch (For Email & Phone) */}
          {mode !== 'forgot' && (
            <div className="flex border border-white/10">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); clearErrors() }}
                  className={`min-h-[44px] flex-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors
                    ${mode === m ? 'bg-ink text-obsidian font-bold' : 'text-mute hover:text-ink'}`}
                >
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* ─── EMAIL & PASSWORD AUTH FORM ─── */}
          {authMethod === 'email' && mode !== 'forgot' && (
            <form onSubmit={handleEmailSubmit} className="mt-7 space-y-5">
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
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErrors() }}
                  required
                />
              </div>

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
                {authLoading ? 'Authenticating…' : mode === 'signup' ? 'START YOUR JOURNEY' : 'ENTER PORTAL'}
              </Btn>
            </form>
          )}

          {/* ─── FORGOT PASSWORD FORM ─── */}
          {mode === 'forgot' && (
            <form onSubmit={handleEmailSubmit} className="mt-7 space-y-5">
              <div>
                <Label>Registered Email</Label>
                <TextInput
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearErrors() }}
                  required
                />
              </div>

              {resetSent && (
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
                disabled={authLoading || !email.trim()}
                className="w-full min-h-[50px] text-[11px] uppercase tracking-[0.25em]"
              >
                {authLoading ? 'Sending Link…' : 'SEND RESET LINK'}
              </Btn>

              <button
                type="button"
                onClick={() => { setMode('login'); setResetSent(false); clearErrors() }}
                className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-mute hover:text-gold transition-colors pt-2"
              >
                ← Back to Log In
              </button>
            </form>
          )}

          {/* ─── MOBILE PHONE OTP AUTH FORM ─── */}
          {authMethod === 'phone' && mode !== 'forgot' && (
            <div className="mt-7">
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
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
                    <Label>Mobile Number</Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => { setCountryCode(e.target.value); clearErrors() }}
                        className="border border-white/15 bg-surface px-3 py-2 text-xs font-mono text-ink focus:border-gold focus:outline-none"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (UAE)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+65">+65 (SG)</option>
                      </select>
                      <TextInput
                        type="tel"
                        placeholder="98765 43210"
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); clearErrors() }}
                        required
                        className="flex-1 font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  {displayedError && (
                    <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] font-semibold text-red-400">
                      {displayedError}
                    </p>
                  )}

                  <Btn
                    type="submit"
                    variant="gold"
                    disabled={authLoading || phoneNumber.length < 8}
                    className="w-full min-h-[50px] text-[11px] uppercase tracking-[0.25em]"
                  >
                    {authLoading ? 'Sending OTP…' : 'SEND VERIFICATION CODE'}
                  </Btn>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>6-Digit Code</Label>
                      <button
                        type="button"
                        onClick={() => { setOtpStep('phone'); clearErrors() }}
                        className="text-[9px] font-semibold text-gold hover:underline uppercase"
                      >
                        Change Number
                      </button>
                    </div>
                    <TextInput
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpToken}
                      onChange={(e) => { setOtpToken(e.target.value); clearErrors() }}
                      required
                      className="text-center font-mono text-lg tracking-[0.4em]"
                    />
                    <p className="mt-1.5 text-[10px] text-mute">
                      Sent to <span className="font-mono text-ink">{fullPhone}</span>
                    </p>
                  </div>

                  {displayedError && (
                    <p className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] font-semibold text-red-400">
                      {displayedError}
                    </p>
                  )}

                  <Btn
                    type="submit"
                    variant="gold"
                    disabled={authLoading || otpToken.length < 6}
                    className="w-full min-h-[50px] text-[11px] uppercase tracking-[0.25em]"
                  >
                    {authLoading ? 'Verifying…' : 'VERIFY & ENTER PORTAL'}
                  </Btn>

                  <div className="text-center pt-2">
                    {resendTimer > 0 ? (
                      <span className="text-[10px] text-mute uppercase font-mono">
                        Resend code in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[10px] font-bold uppercase tracking-wider text-gold hover:underline"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
