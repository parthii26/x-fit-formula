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
import { KeyRound, ShieldCheck, CheckCircle2, X, Eye, EyeOff } from 'lucide-react'

const SESSION_KEY = 'xff-session-v1'

// ─── Build a ClientPortal-compatible object from a Supabase profile ──────────
function buildSupabaseClient(user, profile) {
  const isProfileComplete = Boolean(profile?.gender && profile?.age && profile?.weight)
  return {
    id:           user.id,
    role:         'client',
    onboarded:    isProfileComplete, // Only considered onboarded once biometrics are entered
    supabaseAuth: true,
    profile: {
      name:        profile?.full_name    || user.user_metadata?.full_name || user.email?.split('@')[0] || user.phone || '',
      email:       profile?.email        || user.email || '',
      phone:       profile?.phone        || user.phone || '',
      age:         profile?.age          || '',
      height:      profile?.height       || '',
      heightUnit:  profile?.height_unit  || 'cm',
      weight:      profile?.weight       || '',
      weightUnit:  profile?.weight_unit  || 'kg',
      gender:      profile?.gender       || '',
      lifestyle:   profile?.lifestyle    || '',
      injuries:    profile?.injuries     || '',
      goal:        profile?.goal         || 'general',
      equipment:   profile?.equipment    || 'gym',
      experience:  profile?.experience   || 'beginner',
      daysPerWeek: profile?.days_per_week || 3,
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
  const [initialAuthLoading, setInitialAuthLoading] = useState(isSupabaseConfigured)
  const [authSubmitting,    setAuthSubmitting]    = useState(false)
  const [authError,         setAuthError]         = useState(null)

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
      setInitialAuthLoading(false)
      return
    }

    const safetyTimeout = setTimeout(() => {
      setInitialAuthLoading(false)
    }, 1500)

    // Check for an existing session on mount (e.g. browser refresh)
    supabase.auth.getSession().then(async ({ data: { session: sbSession } }) => {
      if (sbSession?.user) {
        await handleSupabaseUser(sbSession.user)
      }
      setInitialAuthLoading(false)
      clearTimeout(safetyTimeout)
    }).catch(() => {
      setInitialAuthLoading(false)
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
        const rawName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trainer'
        const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
        const trainerName = displayName.toLowerCase().startsWith('coach') ? displayName : `Coach ${displayName}`
        const trainerTitle = profile?.title || 'Head Trainer, X Fit Formula'

        setDb((prev) => ({
          ...prev,
          trainer: {
            id: user.id,
            role: 'trainer',
            name: trainerName,
            title: trainerTitle,
            email: user.email || '',
          },
        }))

        setSession({
          role: 'trainer',
          supabaseAuth: true,
          userId: user.id,
          trainerName,
          trainerTitle,
        })
      } else {
        const clientObj = buildSupabaseClient(user, profile)

        setDb((prev) => {
          const exists = prev.clients.some((c) => c.id === user.id)
          if (exists) {
            return {
              ...prev,
              clients: prev.clients.map((c) => (c.id === user.id ? { ...c, ...clientObj, profile: { ...c.profile, ...clientObj.profile } } : c)),
            }
          }
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
  const handleLogin = async ({ portal, mode, name, email, password }) => {
    setAuthError(null)

    // ── Production Supabase Email + Password Auth ───────────────────────────
    if (isSupabaseConfigured && email && password) {
      setAuthSubmitting(true)
      try {
        if (mode === 'signup') {
          const role = portal === 'trainer' ? 'trainer' : 'client'
          const data = await signUp(email, password, name?.trim() || email.split('@')[0], role)
          
          if (data?.session?.user) {
            await handleSupabaseUser(data.session.user)
            return { success: true }
          }
          if (data?.user) {
            if (data.user.identities && data.user.identities.length === 0) {
              setAuthError('An account with this email already exists. Please switch to Log In.')
              return { error: true }
            }
            return { emailConfirmationRequired: true }
          }
          return { success: true }
        } else {
          const data = await signIn(email, password)
          if (data?.user) {
            await handleSupabaseUser(data.user)
          }
          return { success: true }
        }
      } catch (err) {
        const msg = err.message || ''
        if (msg.toLowerCase().includes('rate limit')) {
          setAuthError('Email rate limit reached on Supabase. To enable instant sign-up without email limits, disable "Confirm email" in Supabase (Authentication > Providers > Email).')
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          setAuthError('Please verify your email via the confirmation link sent to your inbox before logging in.')
        } else if (msg.toLowerCase().includes('invalid login credentials')) {
          setAuthError('Invalid email or password. If you do not have an account, click Sign Up.')
        } else {
          setAuthError(msg || 'Authentication failed. Please check your credentials.')
        }
        return { error: true }
      } finally {
        setAuthSubmitting(false)
      }
    }

    if (mode === 'forgot') {
      if (!isSupabaseConfigured) return
      setAuthSubmitting(true)
      try {
        await resetPassword(email)
      } catch (err) {
        setAuthError(err.message || 'Could not send reset instructions.')
      } finally {
        setAuthSubmitting(false)
      }
      return
    }

    setAuthError('Please enter valid login credentials.')
  }

  // ─── Set New Password Submit Handler (Recovery Flow) ───────────────────────
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
  if (initialAuthLoading) {
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
          authLoading={authSubmitting}
        />
      )
    }

    if (session.role === 'trainer') {
      const activeTrainer = {
        ...db.trainer,
        id: session.userId || db.trainer?.id || 'trainer',
        name: session.trainerName || db.trainer?.name || 'Coach',
        title: session.trainerTitle || db.trainer?.title || 'Head Trainer, X Fit Formula',
      }
      return (
        <TrainerPortal
          trainer={activeTrainer}
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
        trainerName={session?.trainerName || db.trainer?.name || 'Coach'}
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
                <div className="relative">
                  <TextInput
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-mute hover:text-ink transition-colors"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <TextInput
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-mute hover:text-ink transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
