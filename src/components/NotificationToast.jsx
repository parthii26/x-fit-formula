import { useEffect, useState } from 'react'
import { MessageSquare, Sparkles, Dumbbell, Bell, X, ArrowRight, Volume2 } from 'lucide-react'

/**
 * X FIT FORMULA — Luxury Real-time Notification Toast
 * Floating banner for instant message alerts, workout protocol assignments, and check-ins.
 */
export default function NotificationToast({ toast, onDismiss, onAction }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      // Trigger entrance animation
      const enterTimer = setTimeout(() => setVisible(true), 20)
      
      // Auto-dismiss after 6 seconds
      const autoTimer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onDismiss?.(), 300)
      }, 6000)

      return () => {
        clearTimeout(enterTimer)
        clearTimeout(autoTimer)
      }
    }
  }, [toast, onDismiss])

  if (!toast) return null

  const { type = 'message', title, message, senderName, actionLabel } = toast

  const isProgram = type === 'program'
  const isCheckIn = type === 'checkin'

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-[calc(100vw-32px)] sm:w-96 transition-all duration-300 ease-out transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
      }`}
      role="alert"
    >
      <div className="relative overflow-hidden border border-gold/40 bg-surface/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        {/* Ambient luxury accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold via-white to-gold animate-pulse" />

        <div className="flex items-start gap-3.5">
          {/* Icon Badge */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center border ${
              isProgram
                ? 'border-gold bg-gold/10 text-gold'
                : isCheckIn
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-white/20 bg-white/5 text-ink'
            }`}
          >
            {isProgram ? (
              <Sparkles className="h-5 w-5" />
            ) : isCheckIn ? (
              <Dumbbell className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5 text-gold" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">
                  {isProgram ? 'New Protocol' : isCheckIn ? 'Athlete Report' : 'Live Message'}
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="flex items-center gap-1 text-[8px] text-mute uppercase tracking-widest">
                <Volume2 className="h-2.5 w-2.5 text-gold/70" /> Chime
              </span>
            </div>

            <h4 className="mt-1 font-display text-sm font-bold uppercase tracking-wide text-ink truncate">
              {title || (senderName ? `${senderName}` : 'New Notification')}
            </h4>

            <p className="mt-1 text-xs text-mute line-clamp-2 leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            {onAction && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVisible(false)
                    setTimeout(() => {
                      onAction(toast)
                      onDismiss?.()
                    }, 200)
                  }}
                  className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-obsidian transition-colors"
                >
                  <span>{actionLabel || 'View in Portal'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => {
              setVisible(false)
              setTimeout(() => onDismiss?.(), 300)
            }}
            className="shrink-0 p-1 text-mute hover:text-ink transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
