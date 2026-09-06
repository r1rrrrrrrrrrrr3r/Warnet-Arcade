import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGameBySlug, fetchGames, type GameDetail, type GameSummary } from '../lib/api'
import LoadingScreen from '../components/LoadingScreen'
import { RichText } from '../components/RichText'

interface HeroSlide {
  slug: string
  title: string
  engine: string
  genre: string
  description: string
  coverImage: string | null
  accentFrom: string
  accentTo: string
}

interface FeaturedGame {
  slug: string
  title: string
  engine: string
  genre: string
  coverImage: string | null
  accentFrom: string
  accentTo: string
}

const accentPalette = [
  { from: '#ff2fb0', to: '#ffb020' },
  { from: '#22e5ff', to: '#7c1fd6' },
  { from: '#ffb020', to: '#a855f7' },
  { from: '#a855f7', to: '#22e5ff' },
  { from: '#ff2fb0', to: '#a855f7' },
  { from: '#ffb020', to: '#ff8a1f' },
]

const HERO_DESCRIPTION_LIMIT = 355
const HERO_AUTO_ADVANCE_MS = 7000

function truncateDescription(text: string, limit = HERO_DESCRIPTION_LIMIT): string {
  if (text.length <= limit) return text
  return `${text.slice(0, limit).trimEnd()}\u2026`
}

function accentFor(index: number) {
  return accentPalette[index % accentPalette.length]
}

function toHeroSlide(game: GameDetail, index: number): HeroSlide {
  const accent = accentFor(index)
  const firstParagraph = (game.description || 'No description available yet.').split('\n\n')[0]
  return {
    slug: game.slug,
    title: game.title.toUpperCase(),
    engine: game.engine,
    genre: game.genre,
    description: truncateDescription(firstParagraph),
    coverImage: game.coverImage,
    accentFrom: accent.from,
    accentTo: accent.to,
  }
}

function toFeaturedGame(game: GameSummary, index: number): FeaturedGame {
  const accent = accentFor(index)
  return {
    slug: game.slug,
    title: game.title,
    engine: game.engine,
    genre: game.genre,
    coverImage: game.coverImage,
    accentFrom: accent.from,
    accentTo: accent.to,
  }
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 1.2v9.6c0 .8.9 1.3 1.6.9l7.6-4.8a1 1 0 0 0 0-1.7L3.6.3C2.9-.1 2 .4 2 1.2Z" />
    </svg>
  )
}

function ChevronIcon({ direction = 'right' }: { direction?: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 ${direction === 'left' ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="5.5" cy="5" r="2.2" />
      <circle cx="11.3" cy="6" r="1.8" opacity="0.7" />
      <path d="M1 14c0-2.5 2-4.2 4.5-4.2S10 11.5 10 14z" />
      <path d="M10.4 9.9c1.8.35 3.1 1.75 3.1 4.1h-2c0-1.55-.5-2.75-1.55-3.55.15-.2.3-.35.45-.55z" opacity="0.7" />
    </svg>
  )
}

function NoCoverIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4 17l5-5 3 3 3-3.5 5 5.5" />
      <line x1="3" y1="21" x2="21" y2="3" strokeOpacity="0.6" />
    </svg>
  )
}

function HeroCoverPlaceholder({ slide }: { slide: HeroSlide }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(150deg, ${slide.accentFrom}33, ${slide.accentTo}33)` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 25% 20%, ${slide.accentFrom}aa, transparent 60%), radial-gradient(circle at 80% 85%, ${slide.accentTo}aa, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <NoCoverIcon className="h-9 w-9 text-white/40 sm:h-10 sm:w-10" />
        <p className="font-arcade text-lg text-white/70 sm:text-xl">{slide.title}</p>
        <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-white/40 sm:text-xs">
          Cover Coming Soon
        </p>
      </div>
    </div>
  )
}

function EnginePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-arcade-amber/40 bg-black/30 px-2 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-widest text-arcade-amber sm:text-[10px]">
      {label}
    </span>
  )
}

function GenrePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-arcade-purple/40 bg-black/30 px-2 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-widest text-arcade-purple sm:text-[10px]">
      {label}
    </span>
  )
}

function GameCard({ game, isActive }: { game: FeaturedGame; isActive?: boolean }) {
  const hasCover = Boolean(game.coverImage)

  return (
    <Link
      to={`/game/${game.slug}`}
      className="game-card flex w-28 shrink-0 flex-col gap-1.5 sm:w-36"
    >
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-xl border ${
          isActive ? 'border-arcade-amber shadow-[0_0_18px_rgba(255,176,32,0.45)]' : 'border-white/10'
        }`}
      >
        {hasCover ? (
          <>
            <img
              src={game.coverImage as string}
              alt={`${game.title} cover art`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(150deg, ${game.accentFrom}33, ${game.accentTo}33)` }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${game.accentFrom}aa, transparent 60%), radial-gradient(circle at 80% 85%, ${game.accentTo}aa, transparent 60%)`,
              }}
            />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2 text-center">
              <NoCoverIcon className="h-5 w-5 text-white/40" />
              <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-white/40">
                No Cover Available
              </p>
            </div>
          </div>
        )}
      </div>
      <div>
        <p className="truncate font-display text-xs font-bold text-white sm:text-sm">{game.title}</p>
        <p className="truncate text-[9px] uppercase tracking-wide text-white/50 sm:text-[10px]">
          {game.engine} &bull; {game.genre}
        </p>
      </div>
    </Link>
  )
}

function LibraryCard({ game }: { game: FeaturedGame }) {
  const hasCover = Boolean(game.coverImage)

  return (
    <Link
      to={`/game/${game.slug}`}
      className="game-card group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent transition hover:border-arcade-cyan/40 hover:shadow-[0_0_20px_rgba(34,229,255,0.15)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden border-b border-white/10">
        {hasCover ? (
          <>
            <img
              src={game.coverImage as string}
              alt={`${game.title} cover art`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(150deg, ${game.accentFrom}33, ${game.accentTo}33)` }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${game.accentFrom}aa, transparent 60%), radial-gradient(circle at 80% 85%, ${game.accentTo}aa, transparent 60%)`,
              }}
            />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2 text-center">
              <NoCoverIcon className="h-6 w-6 text-white/40" />
              <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-white/40">
                No Cover Available
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <p className="truncate font-display text-xs font-bold text-white sm:text-sm">{game.title}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <EnginePill label={game.engine} />
          <GenrePill label={game.genre} />
        </div>
      </div>
    </Link>
  )
}

function HomePage() {
  const rowRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [isHeroPaused, setIsHeroPaused] = useState(false)

  const [games, setGames] = useState<GameSummary[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const gameList = await fetchGames()
      setGames(gameList)
      setCurrentSlide(0)
      const featuredGames = gameList.filter((game) => game.featured)
      const heroCandidates = featuredGames.length > 0 ? featuredGames : gameList.slice(0, 3)
      const heroDetails = await Promise.all(
        heroCandidates.map((game) => fetchGameBySlug(game.slug))
      )
      setHeroSlides(heroDetails.map(toHeroSlide))
    } catch {
      setError('Failed to load the arcade library. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  const slide = heroSlides[currentSlide]

  const goToSlide = (index: number) => {
    if (heroSlides.length === 0) return
    const next = (index + heroSlides.length) % heroSlides.length
    setCurrentSlide(next)
    setAnimKey((k) => k + 1)
  }

  const nextSlide = () => goToSlide(currentSlide + 1)
  const prevSlide = () => goToSlide(currentSlide - 1)

  // Auto-advance the hero carousel, pausing while the user is hovering
  // or has focused a control inside it (e.g. via keyboard navigation).
  useEffect(() => {
    if (heroSlides.length <= 1 || isHeroPaused) return
    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % heroSlides.length)
      setAnimKey((k) => k + 1)
    }, HERO_AUTO_ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [heroSlides.length, isHeroPaused, currentSlide])

  const handleHeroKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nextSlide()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      prevSlide()
    }
  }

  const scrollRow = (direction: 'left' | 'right') => {
    rowRef.current?.scrollBy({ left: direction === 'right' ? 260 : -260, behavior: 'smooth' })
  }

  if (loading) {
    return <LoadingScreen title="Loading" subtitle="Booting up the arcade library..." />
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-arcade text-lg text-arcade-magenta sm:text-xl">CONNECTION ERROR</p>
        <p className="max-w-xs text-[11px] leading-relaxed text-white/60 sm:text-xs">{error}</p>
        <button
          type="button"
          onClick={loadGames}
          className="neon-btn-outline mt-1 rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
        >
          Retry
        </button>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-arcade text-lg text-arcade-magenta sm:text-xl">ARCADE EMPTY</p>
        <p className="max-w-xs text-[11px] leading-relaxed text-white/60 sm:text-xs">
          No games are currently published. Check back soon for new arrivals.
        </p>
      </div>
    )
  }

  const libraryGames = games.map((game, index) => toFeaturedGame(game, index))
  const featuredOnly = games
    .filter((game) => game.featured)
    .map((game, index) => toFeaturedGame(game, index))

  return (
    <>
      {/* Scoped keyframes for the carousel's slide-in transition */}
      <style>{`
        @keyframes heroSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-slide-enter {
          animation: heroSlideIn 0.4s ease-out;
        }
      `}</style>

      <div className="flex items-center justify-between px-3 pt-3 sm:px-6">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-arcade-cyan">
          <span className="mr-1.5 text-arcade-amber">&bull;</span>
          Now Playing
        </p>
        <span className="flex items-center gap-1.5 rounded-full border border-arcade-amber/40 bg-black/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-arcade-amber">
          <PeopleIcon className="h-2.5 w-2.5" />
          1-4 Players
        </span>
      </div>

      {slide && (
        <section
          className="flex flex-col gap-4 px-3 pb-4 pt-3 sm:px-6 md:flex-row md:items-center md:gap-6"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured games"
          tabIndex={0}
          onKeyDown={handleHeroKeyDown}
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
          onFocus={() => setIsHeroPaused(true)}
          onBlur={() => setIsHeroPaused(false)}
        >
          <div key={`text-${animKey}`} className="hero-slide-enter flex w-full flex-col gap-2 md:w-2/5">
            <h2 className="bg-gradient-to-r from-arcade-magenta via-arcade-amber to-arcade-cyan bg-clip-text font-arcade text-2xl leading-tight text-transparent [text-shadow:3px_3px_0_rgba(0,0,0,0.4)] sm:text-3xl">
              {slide.title}
            </h2>
            <div className="flex items-center gap-2">
              <EnginePill label={slide.engine} />
              <GenrePill label={slide.genre} />
            </div>
            <RichText text={slide.description} className="max-w-sm" />
            <div className="mt-1 flex flex-wrap gap-2">
              <Link
                to={`/game/${slide.slug}`}
                className="neon-btn-play flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-black"
              >
                <PlayIcon className="h-2.5 w-2.5" />
                Play
              </Link>
            </div>
          </div>

          <div
            key={`media-${animKey}`}
            className="hero-slide-enter relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 md:w-3/5"
          >
            {slide.coverImage ? (
              <img
                src={slide.coverImage}
                alt={`${slide.title} cover art`}
                className="h-full w-full object-cover"
              />
            ) : (
              <HeroCoverPlaceholder slide={slide} />
            )}

            {heroSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous featured game"
                  className="chevron-btn absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/70"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next featured game"
                  className="chevron-btn absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/70"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {heroSlides.length > 1 && (
        <div className="flex justify-center gap-2 pb-4">
          {heroSlides.map((heroSlide, index) => (
            <button
              key={heroSlide.slug}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to ${heroSlide.title} slide`}
              aria-current={index === currentSlide}
              className={`pagination-dot ${index === currentSlide ? 'is-active' : ''}`}
            />
          ))}
        </div>
      )}

      {featuredOnly.length > 0 && (
        <section className="px-3 pb-6 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
              Featured Games
            </h3>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollRow('left')}
                aria-label="Scroll featured games left"
                className="chevron-btn flex h-6 w-6 items-center justify-center rounded-full text-white/60"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={() => scrollRow('right')}
                aria-label="Scroll featured games right"
                className="chevron-btn flex h-6 w-6 items-center justify-center rounded-full text-white/60"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>
          <div
            ref={rowRef}
            className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featuredOnly.map((game) => (
              <GameCard
                key={game.slug}
                game={game}
                isActive={slide ? game.slug === slide.slug : false}
              />
            ))}
          </div>
        </section>
      )}

      <section className="px-3 pb-8 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
            All Games
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            {libraryGames.length} {libraryGames.length === 1 ? 'game' : 'games'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {libraryGames.map((game) => (
            <LibraryCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </>
  )
}

export default HomePage