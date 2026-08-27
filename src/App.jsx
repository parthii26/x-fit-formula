import { useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import Onboarding, { initialProfile } from './pages/Onboarding.jsx'
import ClientPortal from './pages/ClientPortal.jsx'
import TrainerPortal from './pages/TrainerPortal.jsx'
import { loadDB, saveDB, slugId } from './lib/store.js'
import {
  supabase,
  isSupabaseConfigured,
  signIn,
  signUp,
  signOut,
  getProfile,
  upsertProfile,
  signInWithGoogle,
  sendMobileOtp,
  verifyMobileOtp,
  resetPassword,
  updatePassword,
} from './lib/supabase.js'
import { Label, TextInput, Btn } from './components/ui.jsx'
import { KeyRound, ShieldCheck, CheckCircle2, X } from 'lucide-react'

const SESSION_KEY = 'xff-session-v1'

// ─── Build a ClientPortal-compatible object from a Supabase profile ──────────
function buildSupabaseClient(user, profile) {
  return {
    id:           user.id,
    role:         'client',
    onboarded:    Boolean(profile?.full_name), // onboarding complete when name is set
    supabaseAuth: true,
    profile: {
      name:        profile?.full_name    || user.user_metadata?.full_name || user.email?.split('@')[0] || user.phone || '',
      email:       profile?.email        || user.email || '',
      phone:       profile?.phone        || user.phone || '',
      age:         '',
      height:      '',
      heightUnit:  'cm',
      weight:      '',
      weightUnit:  'kg',
      gender:      '',
      lifestyle:   '',
      injuries:    '',
      goal:        'general',
      equipment:   'gym',
      experience:  'beginner',
      daysPerWeek: 3,
    },
    plan:        null,
    planStatus:  'pending',
    planMeta:    null,
    completed:   {},
    weightLog:   [],
    checkIns:    [],
    messages:    [],
    joined:      profile?.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    lastActive:  'Today',
  }
}

export default function App() {
  const [db,      setDb]      = useState(loadDB)
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [authError,   setAuthError]   = useState(null)

  // Password Recovery state
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Persist localStorage DB on every change
  useEffect(() => { saveDB(db) }, [db])

  // Persist session in sessionStorage
  useEffect(() => {
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else         sessionStorage.removeItem(SESSION_KEY)
    } catch { /* ignore */ }
  }, [session])

  // ── Supabase Auth state listener ──────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false)
      return
    }

    const safetyTimeout = setTimeout(() => {
      setAuthLoading(false)
    }, 1500)

    // Check for an existing session on mount (e.g. browser refresh)
    supabase.auth.getSession().then(async ({ data: { session: sbSession } }) => {
      if (sbSession?.user) {
        await handleSupabaseUser(sbSession.user)
      }
      setAuthLoading(false)
      clearTimeout(safetyTimeout)
    }).catch(() => {
      setAuthLoading(false)
      clearTimeout(safetyTimeout)
    })

    // Listen for sign-in / sign-out / recovery events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sbSession) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsResettingPassword(true)
        } else if (event === 'SIGNED_IN' && sbSession?.user) {
          await handleSupabaseUser(sbSession.user)
        } else if (event === 'SIGNED_OUT') {
          setSession((prev) => prev?.supabaseAuth ? null : prev)
        }
      }
    )

    return () => {
      clearTimeout(safetyTimeout)
      subscription?.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Supabase user → session mapping ──────────────────────────────────────
  async function handleSupabaseUser(user) {
    try {
      const profile = await getProfile(user.id)
      const role    = profile?.role || user.user_metadata?.role || 'client'

      if (role === 'trainer' || role === 'admin') {
        setSession({ role: 'trainer', supabaseAuth: true, userId: user.id })
      } else {
        const clientObj = buildSupabaseClient(user, profile)

        setDb((prev) => {
          const exists = prev.clients.some((c) => c.id === user.id)
          if (exists) return prev
          return { ...prev, clients: [...prev.clients, clientObj] }
        })

        setSession({ role: 'client', supabaseAuth: true, userId: user.id, clientId: user.id })
      }
    } catch (err) {
      console.warn('[Auth] handleSupabaseUser failed:', err.message)
      setSession(null)
    }
  }

  // ─── Client helpers ─────────────────────────────────────────────────────────
  const updateClient = (updated) => {
    setDb((d) => ({ ...d, clients: d.clients.map((c) => (c.id === updated.id ? updated : c)) }))
  }

  // ─── Login handler (100% Production Supabase Authentication) ────────────────
  const handleLogin = async ({ portal, mode, name, email, password, phone, token }) => {
    setAuthError(null)

    // ── Google OAuth Login ──────────────────────────────────────────────────
    if (mode === 'google') {
      if (!isSupabaseConfigured) {
        setAuthError('Supabase is not configured. Please check environment variables.')
        return
      }
      setAuthLoading(true)
      try {
        await signInWithGoogle(portal)
      } catch (err) {
        const msg = err.message || ''
        if (msg.includes('Unsupported provider') || msg.includes('not enabled')) {
          setAuthError('Google OAuth is not enabled in your Supabase project (Authentication > Providers > Google). Please log in with Email & Password.')
        } else {
          setAuthError(msg || 'Google sign-in could not be initiated.')
        }
        setAuthLoading(false)
      }
      return
    }

    // ── Mobile OTP Send ─────────────────────────────────────────────────────
    if (mode === 'phone-otp-send') {
      if (!isSupabaseConfigured) {
        setAuthError('Supabase is not configured.')
        return
      }
      setAuthLoading(true)
      try {
        await sendMobileOtp(phone, portal)
      } catch (err) {
        const msg = err.message || ''
        if (msg.includes('Unsupported phone provider') || msg.includes('not enabled')) {
          setAuthError('SMS/Phone login is not enabled in your Supabase project (Authentication > Providers > Phone). Please log in with Email & Password.')
        } else {
          setAuthError(msg || 'Could not send SMS verification code.')
        }
      } finally {
        setAuthLoading(false)
      }
      return
    }

    // ── Mobile OTP Verify ───────────────────────────────────────────────────
    if (mode === 'phone-otp-verify') {
      if (!isSupabaseConfigured) {
        setAuthError('Supabase is not configured.')
        return
      }
      setAuthLoading(true)
      try {
        await verifyMobileOtp(phone, token)
      } catch (err) {
        setAuthError(err.message || 'Invalid or expired OTP code.')
      } finally {
        setAuthLoading(false)
      }
      return
    }

    // ── Forgot Password Request ─────────────────────────────────────────────
    if (mode === 'forgot') {
      if (!isSupabaseConfigured) {
        setAuthError('Supabase is not configured.')
        return
      }
      setAuthLoading(true)
      try {
        await resetPassword(email)
      } catch (err) {
        setAuthError(err.message || 'Could not send reset instructions.')
      } finally {
        setAuthLoading(false)
      }
      return
    }

    // ── Production Supabase Email + Password Auth ───────────────────────────
    if (isSupabaseConfigured && email && password) {
      setAuthLoading(true)
      try {
        if (mode === 'signup') {
          const role = portal === 'trainer' ? 'trainer' : 'client'
          await signUp(email, password, name?.trim() || email.split('@')[0], role)
          return
        } else {
          await signIn(email, password)
          return
        }
      } catch (err) {
        setAuthError(err.message || 'Authentication failed. Please check your credentials.')
      } finally {
        setAuthLoading(false)
      }
      return
    }

    setAuthError('Please enter valid login credentials.')
  }

  // ─── Set New Password Submit Handler (Recovery Flow) ───────────────────────
  const handleSetNewPassword = async (e) => {
    e.preventDefault()
    setResetError(null)
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.')
      return
    }
    setResetLoading(true)
    try {
      await updatePassword(newPassword)
      setResetSuccess(true)
      setTimeout(() => {
        setIsResettingPassword(false)
        setResetSuccess(false)
        setNewPassword('')
        setConfirmPassword('')
      }, 2000)
    } catch (err) {
      setResetError(err.message || 'Failed to update password.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleOnboardingComplete = async (clientId, profile) => {
    setDb((d) => ({
      ...d,
      clients: d.clients.map((c) =>
        c.id === clientId ? { ...c, profile, onboarded: true, planStatus: 'pending' } : c
      ),
    }))

    // If this is a real Supabase user, persist their profile
    if (session?.supabaseAuth && session?.userId === clientId) {
      await upsertProfile(clientId, {
        full_name: profile.name,
        email:     profile.email || undefined,
        phone:     profile.phone || undefined,
        role:      'client',
      }).catch((err) => console.warn('[Auth] profile sync failed:', err.message))
    }
  }

  const logout = async () => {
    if (session?.supabaseAuth) {
      await signOut().catch(() => {})
    }
    setSession(null)
  }

  // ─── Routing ───────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-mute">
            Connecting
          </p>
        </div>
      </div>
    )
  }

  const renderCurrentPage = () => {
    if (!session) {
      return (
        <Landing
          onLogin={handleLogin}
          authError={authError}
          authLoading={authLoading}
        />
      )
    }

    if (session.role === 'trainer') {
      return (
        <TrainerPortal
          trainer={db.trainer}
          clients={db.clients.filter((c) => c.onboarded)}
          onUpdateClient={updateClient}
          onLogout={logout}
          trainerUserId={session.userId || null}
        />
      )
    }

    const clientId = session.clientId || session.userId
    const client   = db.clients.find((c) => c.id === clientId)
    if (!client) {
      return (
        <Landing
          onLogin={handleLogin}
          authError={authError}
          authLoading={authLoading}
        />
      )
    }

    if (!client.onboarded) {
      return (
        <Onboarding
          initialName={client.profile.name}
          onComplete={(profile) => handleOnboardingComplete(client.id, profile)}
          onLogout={logout}
        />
      )
    }

    return (
      <ClientPortal
        client={client}
        trainerName={db.trainer.name}
        onUpdate={updateClient}
        onLogout={logout}
      />
    )
  }

  return (
    <>
      {isResettingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 p-4 backdrop-blur-md animate-fade-up">
          <div className="w-full max-w-md border border-white/15 bg-surface p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center bg-gold/10 text-gold border border-gold/30">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold">Security Recovery</p>
                  <h3 className="text-base font-bold uppercase text-ink">Set New Password</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResettingPassword(false)}
                className="text-mute hover:text-ink transition-colors p-1"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSetNewPassword} className="mt-6 space-y-4">
              <div>
                <Label>New Password</Label>
                <TextInput
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Confirm New Password</Label>
                <TextInput
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {resetError && (
                <p className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] text-red-400">
                  {resetError}
                </p>
              )}

              {resetSuccess && (
                <div className="border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <Btn
                type="submit"
                variant="gold"
                disabled={resetLoading || resetSuccess}
                className="w-full min-h-[46px] text-xs uppercase tracking-wider"
              >
                {resetLoading ? 'Updating...' : 'SAVE NEW PASSWORD'}
              </Btn>
            </form>
          </div>
        </div>
      )}

      {renderCurrentPage()}
    </>
  )
}
