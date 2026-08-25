import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// ─── Attachment thumbnails + full-screen viewer ─────────────────────────────

export function AttachmentStrip({ attachments, onRemove }) {
  const [viewIdx, setViewIdx] = useState(null)
  if (!attachments || attachments.length === 0) return null

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a, i) => (
          <div key={a.id} className="group relative">
            <button
              type="button"
              onClick={() => setViewIdx(i)}
              className="block h-20 w-20 border border-white/15 bg-surface-2 transition-colors hover:border-gold sm:h-24 sm:w-24"
            >
              <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                aria-label={`Remove ${a.name}`}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border border-white/20 bg-obsidian text-mute transition-colors hover:border-red-400/60 hover:text-red-300"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        ))}
      </div>
      {viewIdx !== null && (
        <Lightbox
          attachments={attachments}
          index={viewIdx}
          onClose={() => setViewIdx(null)}
          onNav={setViewIdx}
        />
      )}
    </>
  )
}

function Lightbox({ attachments, index, onClose, onNav }) {
  const a = attachments[index]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(Math.min(index + 1, attachments.length - 1))
      if (e.key === 'ArrowLeft') onNav(Math.max(index - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, attachments.length, onClose, onNav])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-obsidian/95 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.3em] text-mute">
          {a.name} — {index + 1} / {attachments.length}
        </p>
        <button onClick={onClose} className="flex h-11 w-11 items-center justify-center text-mute transition-colors hover:text-gold">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-5 sm:p-10" onClick={(e) => e.stopPropagation()}>
        <img src={a.dataUrl} alt={a.name} className="max-h-full max-w-full border border-white/10 object-contain" />
      </div>
      {attachments.length > 1 && (
        <div className="flex justify-center gap-2 border-t border-white/10 px-5 py-4" onClick={(e) => e.stopPropagation()}>
          {attachments.map((att, i) => (
            <button
              key={att.id}
              onClick={() => onNav(i)}
              className={`h-12 w-12 border transition-colors ${i === index ? 'border-gold' : 'border-white/15 opacity-50 hover:opacity-100'}`}
            >
              <img src={att.dataUrl} alt={att.name} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
