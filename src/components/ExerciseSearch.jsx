import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

export default function ExerciseSearch({ value, onChange, placeholder = 'Search exercises by name, target muscle, equipment...' }) {
  const [localText, setLocalText] = useState(value || '')

  useEffect(() => {
    setLocalText(value || '')
  }, [value])

  const handleInput = (e) => {
    const val = e.target.value
    setLocalText(val)
    onChange(val)
  }

  const handleClear = () => {
    setLocalText('')
    onChange('')
  }

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-mute">
        <Search className="h-4 w-4 text-gold/80" strokeWidth={1.75} />
      </div>
      <input
        type="text"
        value={localText}
        onChange={handleInput}
        placeholder={placeholder}
        className="min-h-[48px] w-full rounded-none border border-white/15 bg-surface pl-11 pr-10 text-sm tracking-wide text-ink placeholder-white/25 transition-all focus:border-gold focus:bg-surface-2 focus:outline-none"
      />
      {localText && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-mute transition-colors hover:text-ink"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
