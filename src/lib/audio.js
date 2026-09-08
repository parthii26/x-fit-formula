/**
 * Audio feedback using Web Audio API synthesis
 * Provides pleasant, high-end luxury chimes for message and program notifications without any external asset dependencies.
 */
class SoundEffects {
  constructor() {
    this.ctx = null
  }

  getAudioContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  // Dual-tone harmonic chime for new messages
  playMessageChime() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return
      const now = ctx.currentTime

      // Tone 1: C5 -> E5
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(523.25, now)
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15)
      gain1.gain.setValueAtTime(0.12, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.45)

      // Tone 2: G5 harmony
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(783.99, now + 0.08)
      gain2.gain.setValueAtTime(0.08, now + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.08)
      osc2.stop(now + 0.55)
    } catch {
      // Ignore autoplay audio restrictions
    }
  }

  // Quad-tone ascending flourish for program assignment
  playProgramChime() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return
      const now = ctx.currentTime
      const notes = [440, 554.37, 659.25, 880] // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + i * 0.09)
        gain.gain.setValueAtTime(0.1, now + i * 0.09)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.09)
        osc.stop(now + i * 0.09 + 0.4)
      })
    } catch {
      // Ignore autoplay audio restrictions
    }
  }
}

export const sounds = new SoundEffects()
