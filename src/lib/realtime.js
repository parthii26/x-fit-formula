/**
 * X FIT FORMULA — Realtime Communication & Notification Engine
 * Powered by Supabase Realtime Channels (Broadcast + Postgres CDC)
 */
import { supabase, isSupabaseConfigured, getProfile, upsertProfile } from './supabase.js'
import { sounds } from './audio.js'

const CHANNEL_NAME = 'xff-realtime-live'
let activeChannel = null

/** Request browser desktop notification permission */
export async function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch { /* ignore */ }
    }
  }
}

/** Show OS desktop notification if window is in background */
export function showSystemNotification(title, options = {}) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if (document.hidden) {
        new Notification(title, {
          icon: '/logo.png',
          badge: '/logo.png',
          ...options,
        })
      }
    } catch { /* ignore */ }
  }
}

/** Initialize Realtime Channel Subscriptions */
export function initRealtime({ onMessage, onProgramAssigned, onCheckIn, onProfileSync }) {
  if (!isSupabaseConfigured || !supabase) return () => {}

  if (activeChannel) {
    supabase.removeChannel(activeChannel)
  }

  const channel = supabase.channel(CHANNEL_NAME, {
    config: {
      broadcast: { self: false },
      presence: { key: 'user' },
    },
  })

  // 1. Broadcast: New Message
  channel.on('broadcast', { event: 'message:new' }, ({ payload }) => {
    if (payload && onMessage) {
      sounds.playMessageChime()
      showSystemNotification(`Message from ${payload.senderName || 'Coach'}`, {
        body: payload.text,
      })
      onMessage(payload)
    }
  })

  // 2. Broadcast: Program Assigned / Revised
  channel.on('broadcast', { event: 'program:assigned' }, ({ payload }) => {
    if (payload && onProgramAssigned) {
      sounds.playProgramChime()
      showSystemNotification('New Workout Protocol Assigned', {
        body: `${payload.trainerName || 'Coach'} has assigned your training routine!`,
      })
      onProgramAssigned(payload)
    }
  })

  // 3. Broadcast: Check-In Submitted
  channel.on('broadcast', { event: 'checkin:new' }, ({ payload }) => {
    if (payload && onCheckIn) {
      sounds.playMessageChime()
      showSystemNotification('New Athlete Check-In', {
        body: `${payload.clientName || 'Athlete'} submitted a daily check-in.`,
      })
      onCheckIn(payload)
    }
  })

  // 4. Postgres Table Changes: Profiles
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
    if (onProfileSync && payload.new) {
      onProfileSync(payload.new)
    }
  })

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.info('[Realtime] Connected to live channel:', CHANNEL_NAME)
    }
  })

  activeChannel = channel

  return () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel)
      activeChannel = null
    }
  }
}

/** Broadcast a new message to all clients in real time */
export async function broadcastMessage({ clientId, from, senderName, text, ts }) {
  if (!isSupabaseConfigured || !supabase) return

  const payload = {
    clientId,
    from,
    senderName,
    text,
    ts,
    message: { from, text, ts },
  }

  // Send broadcast over Supabase Realtime channel
  try {
    if (activeChannel) {
      await activeChannel.send({
        type: 'broadcast',
        event: 'message:new',
        payload,
      })
    } else {
      const channel = supabase.channel(CHANNEL_NAME)
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({ type: 'broadcast', event: 'message:new', payload })
        }
      })
    }
  } catch (err) {
    console.warn('[Realtime] broadcastMessage error:', err.message)
  }
}

/** Broadcast program assignment to client in real time */
export async function broadcastProgramAssigned({ clientId, trainerName, plan, planMeta, planStatus = 'assigned', ts }) {
  if (!isSupabaseConfigured || !supabase) return

  const payload = {
    clientId,
    trainerName,
    plan,
    planMeta,
    planStatus,
    ts,
  }

  try {
    if (activeChannel) {
      await activeChannel.send({
        type: 'broadcast',
        event: 'program:assigned',
        payload,
      })
    } else {
      const channel = supabase.channel(CHANNEL_NAME)
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({ type: 'broadcast', event: 'program:assigned', payload })
        }
      })
    }
  } catch (err) {
    console.warn('[Realtime] broadcastProgramAssigned error:', err.message)
  }
}

/** Broadcast check-in report from athlete to trainer in real time */
export async function broadcastCheckIn({ clientId, clientName, checkIn, ts }) {
  if (!isSupabaseConfigured || !supabase) return

  const payload = {
    clientId,
    clientName,
    checkIn,
    ts,
  }

  try {
    if (activeChannel) {
      await activeChannel.send({
        type: 'broadcast',
        event: 'checkin:new',
        payload,
      })
    } else {
      const channel = supabase.channel(CHANNEL_NAME)
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({ type: 'broadcast', event: 'checkin:new', payload })
        }
      })
    }
  } catch (err) {
    console.warn('[Realtime] broadcastCheckIn error:', err.message)
  }
}

