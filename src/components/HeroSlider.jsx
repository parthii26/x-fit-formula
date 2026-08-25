/**
 * HeroSlider.jsx — X FIT FORMULA Premium Hero
 *
 * Features:
 *  - 6s auto-advance crossfade + subtle parallax
 *  - RAF-smoothed cursor glow (desktop only, no gaming cursor)
 *  - Cursor parallax: image shifts 5–12px opposite to cursor
 *  - Touch swipe (left/right) on mobile — no cursor effects
 *  - Dot indicators + edge Prev/Next arrows
 *  - Single timer; resets on manual nav; pauses on hover
 *  - prefers-reduced-motion respected
 *  - GPU-friendly transforms (translate3d, opacity)
 *  - No memory leaks — all timers/RAF cleaned up on unmount
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Play } from 'lucide-react'

// ─── Slide Data ──────────────────────────────────────────────────────────────

export const HERO_SLIDES = [
  {
    id: 'unisex-fitness',
    num: '01',
    kicker: 'Unisex Athletic Strength',
    shortKicker: 'Strength',
    headline: 'ELEVATE YOUR\nSTANDARD',
    description:
      'Precision strength & conditioning engineered for dedicated athletes striving for peak functional performance.',
    image: '/images/hero/hero-1-unisex.jpg',
    tag: 'Movement • Symmetry',
    // focal point: subject centred slightly right; fine for desktop
    objectPos: 'object-[65%_center] sm:object-center',
  },
  {
    id: 'transformation',
    num: '02',
    kicker: 'Metamorphosis',
    shortKicker: 'Transform',
    headline: 'MEASURED\nTRANSFORMATION',
    description:
      'From day one to peak conditioning. A science-backed blueprint guiding every single step of your evolution.',
    image: '/images/hero/hero-2-transformation.jpg',
    tag: 'Adaptation • Consistency',
    objectPos: 'object-[60%_center] sm:object-center',
  },
  {
    id: 'slim-to-build',
    num: '03',
    kicker: 'Hypertrophy Protocol',
    shortKicker: 'Hypertrophy',
    headline: 'FORGE LEAN\nMUSCLE',
    description:
      'Targeted resistance training calibrated to maximise mechanical tension, muscular density, and metabolic rate.',
    image: '/images/hero/hero-3-slim-to-build.jpg',
    tag: 'Progression • Volume',
    objectPos: 'object-[65%_center] sm:object-center',
  },
  {
    id: 'bodybuilding',
    num: '04',
    kicker: 'Elite Performance',
    shortKicker: 'Performance',
    headline: 'UNCOMPROMISING\nPRECISION',
    description:
      'Master compound mechanics and achieve breakthrough athletic benchmarks under direct coach supervision.',
    image: '/images/hero/hero-4-bodybuilding.jpg',
    tag: 'Mastery • Intensity',
    objectPos: 'object-[70%_center] sm:object-center',
  },
]

const SLIDE_DURATION = 6000 // ms

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lerp helper for spring-like smoothing */
const lerp = (a, b, t) => a + (b - a) * t

/** Detect non-hover pointer environments (touch) */
const detectTouch = () =>
  window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window

/** Detect reduced-motion preference */
const detectReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroSlider({ onSelectPortal, onOpenLibrary }) {
  const [current, setCurrent]       = useState(0)
  const [isPaused, setIsPaused]     = useState(false)
  const [isTouch, setIsTouch]       = useState(false)
  const [reducedMotion, setRm]      = useState(false)

  // Glow position — kept in a ref to avoid re-renders on every RAF tick
  const glowRef      = useRef(null)    // DOM node of the glow element
  const parallaxRef  = useRef(null)    // DOM node of parallax image wrapper
  const containerRef = useRef(null)

  // Raw target coords (updated on mousemove, no state)
  const targetPos = useRef({ x: 0.5, y: 0.5 }) // normalised 0–1
  const currentPos = useRef({ x: 0.5, y: 0.5 })
  const rafId      = useRef(null)
  const timerRef   = useRef(null)

  // Touch swipe tracking
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  // ── Detect capabilities on mount ──
  useEffect(() => {
    setIsTouch(detectTouch())
    setRm(detectReducedMotion())

    const mqTouch = window.matchMedia('(pointer: coarse)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onTC = (e) => setIsTouch(e.matches)
    const onRM = (e) => setRm(e.matches)
    mqTouch.addEventListener('change', onTC)
    mqMotion.addEventListener('change', onRM)
    return () => {
      mqTouch.removeEventListener('change', onTC)
      mqMotion.removeEventListener('change', onRM)
    }
  }, [])

  // ── Single auto-advance timer ──
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
    }, SLIDE_DURATION)
  }, [])

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPaused, startTimer])

  // ── Preload next slide image ──
  useEffect(() => {
    const nextIdx = (current + 1) % HERO_SLIDES.length
    const img = new Image()
    img.src = HERO_SLIDES[nextIdx].image
  }, [current])

  // ── RAF cursor animation loop (desktop only, not reduced motion) ──
  useEffect(() => {
    if (isTouch || reducedMotion) return

    const animate = () => {
      // Spring-lerp toward mouse target — t=0.08 = smooth lag
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.08)
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.08)

      const cx = currentPos.current.x
      const cy = currentPos.current.y

      // Glow: follows cursor in absolute px within the container
      if (glowRef.current && containerRef.current) {
        const w = containerRef.current.offsetWidth
        const h = containerRef.current.offsetHeight
        const gx = cx * w - 280  // centre the 560px wide glow
        const gy = cy * h - 280
        glowRef.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`
      }

      // Parallax: image shifts opposite to cursor, max ±10px
      if (parallaxRef.current) {
        const px = (cx - 0.5) * -10
        const py = (cy - 0.5) * -10
        parallaxRef.current.style.transform = `translate3d(${px}px, ${py}px, 0) scale(1.04)`
      }

      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [isTouch, reducedMotion])

  // ── Mouse tracking (normalised 0–1, only writes ref, no state) ──
  const handleMouseMove = useCallback((e) => {
    if (isTouch || reducedMotion || !containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    targetPos.current = {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top)  / r.height)),
    }
  }, [isTouch, reducedMotion])

  // ── Touch swipe handlers ──
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    // Only handle clearly horizontal swipes (dx > 40px, less vertical than horizontal)
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  // ── Navigation helpers (reset timer on manual nav) ──
  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
    if (!isPaused) startTimer()
  }
  const goNext = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
    if (!isPaused) startTimer()
  }
  const goTo = (idx) => {
    setCurrent(idx)
    if (!isPaused) startTimer()
  }

  const activeSlide = HERO_SLIDES[current]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isTouch && setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        // Ease glow back to centre
        targetPos.current = { x: 0.5, y: 0.5 }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-obsidian text-ink border-b border-white/10"
      style={{ minHeight: 'clamp(560px, 85vh, 820px)' }}
      aria-label="X Fit Formula Hero Showcase"
      aria-roledescription="carousel"
    >

      {/* ── Layer 1: Background Images (crossfade stack) ─────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {HERO_SLIDES.map((slide, idx) => {
          const active = idx === current
          return (
            <div
              key={slide.id}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                reducedMotion ? 'duration-200' : 'duration-1000'
              } ${active ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={slide.image}
                alt={slide.kicker}
                // Only the active slide uses the parallax wrapper transform;
                // others stay at natural scale so they don't peek out during crossfade
                ref={active ? parallaxRef : undefined}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover will-change-transform ${slide.objectPos}`}
                style={
                  // On mobile/reduced-motion, no transform; on desktop RAF handles it
                  active && !isTouch && !reducedMotion
                    ? { transform: 'translate3d(0,0,0) scale(1.04)' }
                    : { transform: 'scale(1)' }
                }
              />

              {/* Gradient overlays — two-pass for both mobile & desktop */}
              {/* Mobile: strong top+bottom vignette so text is always legible */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/30 sm:hidden" />
              {/* Desktop/Tablet: classic editorial left fade */}
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-obsidian/95 via-obsidian/70 to-obsidian/10" />
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/40" />
              {/* Universal subtle dark film so text is never washed out */}
              <div className="absolute inset-0 bg-obsidian/15" />
            </div>
          )
        })}

        {/* ── Layer 2: Cursor Glow (desktop only) ──────────────────────── */}
        {!isTouch && !reducedMotion && (
          <div
            ref={glowRef}
            aria-hidden="true"
            className="absolute top-0 left-0 h-[560px] w-[560px] rounded-full pointer-events-none will-change-transform"
            style={{
              background:
                'radial-gradient(circle, rgba(198,168,124,0.13) 0%, rgba(198,168,124,0.05) 45%, transparent 70%)',
              filter: 'blur(40px)',
              transform: 'translate3d(-280px,-280px,0)',   // starts off-screen
              transition: 'none',                          // RAF handles movement
            }}
          />
        )}
      </div>

      {/* ── Layer 3: Prev / Next edge arrows ─────────────────────────────── */}
      {/* Desktop edge arrows */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 z-20 -translate-y-1/2
          h-11 w-11 items-center justify-center
          border border-white/15 bg-obsidian/50 text-white/60 backdrop-blur-sm
          transition-all duration-300 hover:border-gold hover:text-gold hover:bg-obsidian/70
          active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 z-20 -translate-y-1/2
          h-11 w-11 items-center justify-center
          border border-white/15 bg-obsidian/50 text-white/60 backdrop-blur-sm
          transition-all duration-300 hover:border-gold hover:text-gold hover:bg-obsidian/70
          active:scale-95"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {/* ── Layer 4: Hero Content ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-10 lg:px-16 flex flex-col justify-center h-full" style={{ minHeight: 'clamp(500px, 75vh, 740px)' }}>
        {/* Key on slide id so text re-animates on slide change */}
        <div className="max-w-xl sm:max-w-2xl animate-fade-up" key={activeSlide.id}>

          {/* Kicker badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-2.5 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gold leading-none">
              <Sparkles className="h-3 w-3 shrink-0" />
              {activeSlide.num} — {activeSlide.kicker}
            </span>
            <span className="hidden sm:inline text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {activeSlide.tag}
            </span>
          </div>

          {/* Headline — fluid clamp typography */}
          <h1
            className="mt-4 sm:mt-5 font-display font-extrabold uppercase leading-[0.95] tracking-[0.04em] sm:tracking-[0.06em]"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
          >
            {activeSlide.headline.split('\n').map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? (
                  <span
                    className="text-transparent"
                    style={{ WebkitTextStroke: '1.5px #C6A87C' }}
                  >
                    {line}
                  </span>
                ) : line}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p className="mt-4 sm:mt-5 max-w-lg text-xs sm:text-sm lg:text-base leading-relaxed text-mute">
            {activeSlide.description}
          </p>

          {/* CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4">
            {/* Primary — START YOUR JOURNEY */}
            <button
              id="hero-cta-start-journey"
              onClick={() => onSelectPortal('client')}
              className="
                group relative flex min-h-[50px] items-center justify-center gap-3
                bg-gold px-6 sm:px-8
                text-[11px] font-extrabold uppercase tracking-[0.25em] text-obsidian
                transition-all duration-300
                hover:bg-[#d8bd93]
                hover:shadow-[0_6px_28px_rgba(198,168,124,0.45)]
                hover:-translate-y-0.5
                active:scale-[0.97] active:translate-y-0
              "
              aria-label="Start your fitness journey"
            >
              <span>START YOUR JOURNEY</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </button>

            {/* Secondary — Movement Library */}
            <button
              onClick={onOpenLibrary}
              className="
                flex min-h-[50px] items-center justify-center gap-2.5
                border border-white/20 bg-surface/80 px-5 sm:px-6
                text-[10px] font-bold uppercase tracking-[0.25em] text-ink backdrop-blur-sm
                transition-all duration-300 hover:border-gold hover:text-gold
                active:scale-[0.97]
              "
              aria-label="Explore Movement Library"
            >
              <Play className="h-3.5 w-3.5 fill-current shrink-0" />
              Movement Library
            </button>
          </div>
        </div>
      </div>

      {/* ── Layer 5: Bottom control bar (tabs + dots + arrows) ───────────── */}
      <div className="relative z-10 border-t border-white/10 bg-obsidian/85 backdrop-blur-md px-4 py-3 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-row items-center justify-between gap-2 sm:gap-4">

          {/* Scene tabs — 4 columns, always visible */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1">
            {HERO_SLIDES.map((slide, idx) => {
              const active = idx === current
              return (
                <button
                  key={slide.id}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to slide ${slide.num}: ${slide.kicker}`}
                  aria-pressed={active}
                  className={`
                    group relative flex flex-col justify-center p-2 sm:p-2.5 text-left border
                    min-h-[44px] transition-all duration-300
                    ${active
                      ? 'border-gold bg-gold/10'
                      : 'border-white/10 bg-surface/50 hover:border-white/25'}
                  `}
                >
                  {/* Live progress hairline — resets per slide */}
                  {active && !isPaused && !reducedMotion && (
                    <span
                      className="absolute top-0 left-0 h-[2px] bg-gold"
                      style={{ animation: `progress ${SLIDE_DURATION}ms linear forwards` }}
                    />
                  )}
                  <span className={`text-[8px] font-bold uppercase tracking-wider leading-none ${active ? 'text-gold' : 'text-white/40 group-hover:text-white/60'}`}>
                    {slide.num}
                  </span>
                  <span className={`mt-0.5 font-display font-bold uppercase tracking-wider truncate leading-tight ${active ? 'text-ink text-[9px] sm:text-[10px]' : 'text-mute group-hover:text-ink text-[9px] sm:text-[10px]'}`}>
                    <span className="hidden sm:inline">{slide.kicker}</span>
                    <span className="sm:hidden">{slide.shortKicker}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right-side: dot indicators + prev/next (mobile) */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            {/* Dot indicators */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Slide indicators">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={idx === current}
                  onClick={() => goTo(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`
                    rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
                    ${idx === current
                      ? 'bg-gold w-4 h-1.5'
                      : 'bg-white/25 hover:bg-white/50 w-1.5 h-1.5'}
                  `}
                />
              ))}
            </div>

            {/* Prev / Next (shown on mobile in bottom bar; hidden on sm+ where edge arrows exist) */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                onClick={goPrev}
                aria-label="Previous slide"
                className="flex h-9 w-9 items-center justify-center border border-white/10 bg-surface text-mute
                  transition-colors hover:border-gold hover:text-gold active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={goNext}
                aria-label="Next slide"
                className="flex h-9 w-9 items-center justify-center border border-white/10 bg-surface text-mute
                  transition-colors hover:border-gold hover:text-gold active:scale-95"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
