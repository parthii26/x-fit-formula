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
} from './lib/supabase.js'

const SESSION_KEY = 'xff-session-v1'

// ─── Build a ClientPortal-compatible object from a Supabase profile ──────────
function buildSupabaseClient(user, profile) {
  return {
    id:           user.id,
    role:         'client',
    onboarded:    Boolean(profile?.full_name), // onboarding complete when name is set
    supabaseAuth: true,
    profile: {
      name:        profile?.full_name    || user.email?.split('@')[0] || '',
      email:       profile?.email        || user.email || '',
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

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sbSession) => {
        if (event === 'SIGNED_IN' && sbSession?.user) {
          await handleSupabaseUser(sbSession.user)
        } else if (event === 'SIGNED_OUT') {
          // Only clear if it was a Supabase session (not a demo session)
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
      const role    = profile?.role || 'client'

      if (role === 'trainer' || role === 'admin') {
        setSession({ role: 'trainer', supabaseAuth: true, userId: user.id })
      } else {
        // Build a ClientPortal-compatible client object and store it
        const clientObj = buildSupabaseClient(user, profile)

        // If this Supabase client isn't in the local DB yet, add them
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

  // ─── Login handler ──────────────────────────────────────────────────────────
  const handleLogin = async ({ portal, mode, name, clientId, email, password }) => {
    setAuthError(null)

    // ── Demo quick-access (always available regardless of Supabase) ──
    if (portal === 'trainer' && mode === 'login' && !email) {
      setSession({ role: 'trainer' })
      return
    }
    if (mode === 'demo' && clientId) {
      setSession({ role: 'client', clientId })
      return
    }
    if (mode === 'demo-new') {
      const id    = slugId(name || 'new-client')
      const fresh = {
        id, role: 'client', onboarded: false,
        profile: { ...initialProfile, name: name || '' },
        plan: null, planStatus: 'pending', planMeta: null,
        completed: {}, weightLog: [], checkIns: [], messages: [],
        joined:     new Date().toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        lastActive: 'Today',
      }
      setDb((d) => ({ ...d, clients: [...d.clients, fresh] }))
      setSession({ role: 'client', clientId: id })
      return
    }

    // ── Real Supabase Auth ──────────────────────────────────────────────────
    if (isSupabaseConfigured && email && password) {
      setAuthLoading(true)
      try {
        if (mode === 'signup') {
          const role = portal === 'trainer' ? 'trainer' : 'client'
          await signUp(email, password, name?.trim() || email.split('@')[0], role)
          // onAuthStateChange will handle the session after email confirmation
          // If email confirmation is disabled in Supabase settings, login happens immediately
          return
        } else {
          await signIn(email, password)
          // onAuthStateChange → handleSupabaseUser handles the rest
          return
        }
      } catch (err) {
        setAuthError(err.message || 'Authentication failed. Please try again.')
      } finally {
        setAuthLoading(false)
      }
      return
    }

    // ── Fallback mock auth (no Supabase configured) ──────────────────────────
    if (portal === 'trainer') {
      setSession({ role: 'trainer' })
      return
    }
    if (mode === 'login') {
      const firstClient = db.clients.find((c) => c.onboarded)
      if (firstClient) setSession({ role: 'client', clientId: firstClient.id })
      return
    }
    const id    = slugId(name || 'new-client')
    const fresh = {
      id, role: 'client', onboarded: false,
      profile: { ...initialProfile, name: name || '' },
      plan: null, planStatus: 'pending', planMeta: null,
      completed: {}, weightLog: [], checkIns: [], messages: [],
      joined:     new Date().toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      lastActive: 'Today',
    }
    setDb((d) => ({ ...d, clients: [...d.clients, fresh] }))
    setSession({ role: 'client', clientId: id })
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

  if (!session) {
    return (
      <Landing
        onLogin={handleLogin}
        authError={authError}
        authLoading={authLoading}
        demoClients={db.clients.filter((c) => c.onboarded && !c.supabaseAuth)}
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
        demoClients={db.clients.filter((c) => c.onboarded && !c.supabaseAuth)}
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
