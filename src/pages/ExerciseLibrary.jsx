import { useEffect, useState, useMemo } from 'react'
import { Dumbbell, ArrowLeft, RotateCcw, AlertCircle, Sparkles, Flame, CheckCircle, Home, Layers, Calendar, ChevronRight } from 'lucide-react'
import { fetchExercises, fetchHomeWorkoutVideos, fetchGymWorkoutVideos } from '../lib/supabase.js'
import ExerciseCard from '../components/ExerciseCard.jsx'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import ExerciseFilters from '../components/ExerciseFilters.jsx'
import ExerciseDetailModal from '../components/ExerciseDetailModal.jsx'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ExerciseLibrary({ onBack, embedded = false, initialCollection = 'gym' }) {
  // 'gym' (Official Gym Workout Collection) | 'home' (Official Home Workout Collection) | 'all' (Full Movement Library)
  const [collection, setCollection] = useState(initialCollection)
  const [gymLevel, setGymLevel] = useState('All') // 'All' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [gymDay, setGymDay] = useState('All') // 'All' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  const [homeLevel, setHomeLevel] = useState('All') // 'All' | 'Beginner' | 'Intermediate' | 'Advanced'

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [difficulty, setDifficulty] = useState('All')
  const [category, setCategory] = useState('All')
  const [bodyPart, setBodyPart] = useState('All')
  const [equipment, setEquipment] = useState('All')

  const [exercises, setExercises] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState(null)

  // Debounce search (250ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch exercises based on active collection
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    if (collection === 'gym') {
      fetchGymWorkoutVideos({
        level: gymLevel,
        day: gymDay,
        search: debouncedSearch,
      })
        .then((res) => {
          if (active) {
            setExercises(res.videos || [])
            setTotalCount(res.totalCount || 0)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (active) {
            console.error('Failed to load gym workout library:', err)
            setError("We couldn't load the gym workout library. Please try again.")
            setLoading(false)
          }
        })
    } else if (collection === 'home') {
      fetchHomeWorkoutVideos({
        level: homeLevel,
        search: debouncedSearch,
      })
        .then((res) => {
          if (active) {
            setExercises(res.videos || [])
            setTotalCount(res.totalCount || 0)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (active) {
            console.error('Failed to load home workout video library:', err)
            setError("We couldn't load the home workout library. Please try again.")
            setLoading(false)
          }
        })
    } else {
      fetchExercises({
        search: debouncedSearch,
        difficulty,
        category,
        bodyPart,
        equipment,
        limit: 100,
        offset: 0,
      })
        .then((res) => {
          if (active) {
            setExercises(res.exercises || [])
            setTotalCount(res.totalCount || 0)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (active) {
            console.error('Failed to load exercise library:', err)
            setError("We couldn't load the exercise library. Please try again.")
            setLoading(false)
          }
        })
    }

    return () => {
      active = false
    }
  }, [collection, gymLevel, gymDay, homeLevel, debouncedSearch, difficulty, category, bodyPart, equipment])

  // Group gym exercises by day for structured view when 'All' is selected
  const groupedDays = useMemo(() => {
    if (collection !== 'gym' || debouncedSearch) return []
    const groups = []
    const daysToInclude = gymDay === 'All' ? DAYS_OF_WEEK : [gymDay]

    daysToInclude.forEach((dayName) => {
      const dayExercises = exercises.filter(
        (ex) => (ex.day || '').toLowerCase() === dayName.toLowerCase()
      )
      if (dayExercises.length > 0) {
        const splitName = dayExercises[0]?.split_name || 'Workout Routine'
        groups.push({
          dayName,
          splitName,
          dayExercises,
        })
      }
    })
    return groups
  }, [collection, exercises, gymDay, debouncedSearch])

  const resetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setGymLevel('All')
    setGymDay('All')
    setHomeLevel('All')
    setDifficulty('All')
    setCategory('All')
    setBodyPart('All')
    setEquipment('All')
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    (collection === 'gym' && (gymLevel !== 'All' || gymDay !== 'All')) ||
    (collection === 'home' && homeLevel !== 'All') ||
    (collection === 'all' &&
      (difficulty !== 'All' || category !== 'All' || bodyPart !== 'All' || equipment !== 'All'))

  return (
    <div className={`min-h-screen bg-obsidian text-ink ${embedded ? '' : 'pb-24'}`}>
      {/* Standalone Header (when rendered directly from landing) */}
      {!embedded && (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-obsidian/95 px-6 py-4 backdrop-blur-md sm:px-12">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-mute transition-colors hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Return
              </button>
            )}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="X Fit Formula" className="h-8 w-8 rounded object-cover ring-1 ring-gold/25" />
              <span className="font-display text-xs font-bold uppercase tracking-[0.3em] text-ink">
                X FIT FORMULA
              </span>
            </div>
          </div>

          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold">
            Official Video Library
          </span>
        </header>
      )}

      {/* Main Container */}
      <div className={embedded ? '' : 'mx-auto max-w-6xl px-5 pt-8 sm:px-8 lg:px-12'}>
        {/* Page Header */}
        <div className="animate-fade-up">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gold">
            {collection === 'gym'
              ? 'Official Gym Workout Collection'
              : collection === 'home'
              ? 'Official Home Workout Collection'
              : 'Biomechanics & Movement Database'}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-[0.08em] sm:text-4xl lg:text-5xl">
            {collection === 'gym'
              ? 'Gym Workout Library'
              : collection === 'home'
              ? 'Home Workout Library'
              : 'Movement Database'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed tracking-wide text-mute">
            {collection === 'gym'
              ? 'Official structured gym training series categorized by level: Beginner (21), Intermediate (33), and Advanced (54) with day-by-day training splits and motion demonstrators.'
              : collection === 'home'
              ? 'Official structured home training series categorized by level: Beginner (7), Intermediate (11), and Advanced (11).'
              : 'Explore comprehensive resistance movements, biomechanics instructions, and execution technique.'}
          </p>
        </div>

        {/* Collection Switcher Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => {
              setCollection('gym')
              setSearch('')
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              collection === 'gym'
                ? 'border-b-2 border-gold bg-gold/10 text-gold'
                : 'border border-white/10 text-mute hover:text-ink hover:border-white/20'
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            Gym Workouts (Client Collection)
          </button>

          <button
            type="button"
            onClick={() => {
              setCollection('home')
              setSearch('')
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              collection === 'home'
                ? 'border-b-2 border-gold bg-gold/10 text-gold'
                : 'border border-white/10 text-mute hover:text-ink hover:border-white/20'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            Home Workouts (Client Collection)
          </button>

          <button
            type="button"
            onClick={() => {
              setCollection('all')
              setSearch('')
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              collection === 'all'
                ? 'border-b-2 border-gold bg-gold/10 text-gold'
                : 'border border-white/10 text-mute hover:text-ink hover:border-white/20'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Full Movement Library
          </button>
        </div>

        {/* Level Filters for Gym Workout Collection */}
        {collection === 'gym' && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute mr-2">
                Filter By Level:
              </span>
              {[
                { key: 'All', label: 'All Levels (108)' },
                { key: 'Beginner', label: 'Beginner (21)' },
                { key: 'Intermediate', label: 'Intermediate (33)' },
                { key: 'Advanced', label: 'Advanced (54)' },
              ].map(({ key, label }) => {
                const active = gymLevel === key
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setGymLevel(key)
                      setGymDay('All')
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      active
                        ? 'bg-gold text-obsidian shadow-sm font-extrabold'
                        : 'border border-white/10 bg-surface text-mute hover:border-gold/50 hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute mr-2">
                Day Split:
              </span>
              {['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => {
                const active = gymDay === d
                return (
                  <button
                    key={d}
                    onClick={() => setGymDay(d)}
                    className={`min-h-[32px] px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      active
                        ? 'border border-gold bg-gold/20 text-gold font-bold'
                        : 'border border-white/10 bg-surface/60 text-mute hover:text-ink hover:border-white/20'
                    }`}
                  >
                    {d === 'All' ? 'All Days' : d}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Level Filters for Home Workout Collection */}
        {collection === 'home' && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-mute mr-2">
              Filter By Level:
            </span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
              const active = homeLevel === lvl
              return (
                <button
                  key={lvl}
                  onClick={() => setHomeLevel(lvl)}
                  className={`min-h-[38px] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-gold text-obsidian shadow-sm font-bold'
                      : 'border border-white/10 bg-surface text-mute hover:border-gold/50 hover:text-ink'
                  }`}
                >
                  {lvl === 'All' ? 'All Levels (29)' : lvl === 'Beginner' ? 'Beginner (7)' : lvl === 'Intermediate' ? 'Intermediate (11)' : 'Advanced (11)'}
                </button>
              )
            })}
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="mt-6 space-y-4">
          <ExerciseSearch
            value={search}
            onChange={setSearch}
            placeholder={
              collection === 'gym'
                ? 'Search gym workout exercises (e.g. Barbell Flat Bench Press, Incline Dumbbell Press, T-Bar, Skullcrusher)...'
                : collection === 'home'
                ? 'Search home workout tutorials (e.g. Incline Push-Ups, Free Squats)...'
                : 'Search all movements by name, muscle, equipment...'
            }
          />

          {collection === 'all' && (
            <ExerciseFilters
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              category={category}
              setCategory={setCategory}
              bodyPart={bodyPart}
              setBodyPart={setBodyPart}
              equipment={equipment}
              setEquipment={setEquipment}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </div>

        {/* Results Counter / Filter Status */}
        <div className="mt-6 flex items-center justify-between border-b border-white/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mute">
            Showing <span className="text-gold">{loading ? '...' : exercises.length}</span>{' '}
            {collection === 'gym'
              ? 'gym workouts'
              : collection === 'home'
              ? 'home workout tutorials'
              : 'movements'}
          </p>
          {hasActiveFilters && (
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gold/80">
              Filtered View
            </span>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-12 flex flex-col items-center justify-center border border-rose-500/20 bg-rose-500/5 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-rose-300">{error}</p>
            <button
              onClick={() => resetFilters()}
              className="mt-6 border border-white/20 bg-surface px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-ink hover:border-gold hover:text-gold"
            >
              Retry / Reset
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-white/10 bg-surface">
                <div className="aspect-[4/3] w-full bg-surface-2" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-white/10" />
                  <div className="h-3 w-1/2 bg-white/5" />
                  <div className="pt-3 flex justify-between">
                    <div className="h-3 w-1/4 bg-white/5" />
                    <div className="h-3 w-1/4 bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && exercises.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center border border-white/10 bg-surface p-12 text-center sm:p-16">
            <Dumbbell className="h-12 w-12 text-white/20" strokeWidth={1} />
            <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-wider text-ink">
              No exercises found.
            </h3>
            <p className="mt-2 text-sm text-mute">
              Try adjusting your search query, level, or day split filter.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 flex items-center gap-2 border border-gold/40 bg-gold/10 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold hover:text-obsidian"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
            </button>
          </div>
        )}

        {/* Gym Structured Daily Split View (Grouped by Day) */}
        {!loading && !error && collection === 'gym' && groupedDays.length > 0 && (
          <div className="mt-8 space-y-12">
            {groupedDays.map(({ dayName, splitName, dayExercises }) => (
              <div key={dayName} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-gold/40 bg-gold/5 px-5 py-4 border-l-4 border-l-gold">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-gold">
                      {gymLevel === 'All' ? 'Gym Split Protocol' : `${gymLevel} Curriculum`}
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide text-ink">
                      {dayName} — <span className="text-gold">{splitName}</span>
                    </h2>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mute bg-surface px-3 py-1 border border-white/10">
                      {dayExercises.length} Movements
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {dayExercises.map((ex, idx) => (
                    <ExerciseCard
                      key={ex.id || `${ex.slug}-${ex.day}-${ex.level}-${idx}`}
                      exercise={ex}
                      index={idx + 1}
                      onSelect={(selected) => setSelectedExercise(selected)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Standard Exercise Grid (Home Workouts, Movement DB, or Search Results) */}
        {!loading && !error && (collection !== 'gym' || (collection === 'gym' && groupedDays.length === 0)) && exercises.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex, idx) => (
              <ExerciseCard
                key={ex.id || `${ex.slug}-${ex.day}-${ex.level}-${idx}`}
                exercise={ex}
                index={collection === 'gym' ? idx + 1 : undefined}
                onSelect={(selected) => setSelectedExercise(selected)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  )
}
