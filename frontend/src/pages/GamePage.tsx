import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, fetchGameBySlug } from '../lib/api'

interface GameViewModel {
  slug: string
  title: string
  tagline: string
  engine: string
  genres: string[]
  devComment: string
  coverImage: string | null
  accentFrom: string
  accentTo: string
}

const TAGLINE_PLACEHOLDER = 'Jump into the action and see what the arcade has in store.'
const GENRE_PLACEHOLDER = 'Arcade'
const DEFAULT_ACCENT_FROM = '#a855f7'
const DEFAULT_ACCENT_TO = '#22e5ff'

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 1.2v9.6c0 .8.9 1.3 1.6.9l7.6-4.8a1 1 0 0 0 0-1.7L3.6.3C2.9-.1 2 .4 2 1.2Z" />
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

function GameCoverPlaceholder({ game }: { game: GameViewModel }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(150deg, ${game.accentFrom}33, ${game.accentTo}33)` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 25% 20%, ${game.accentFrom}aa, transparent 60%), radial-gradient(circle at 80% 85%, ${game.accentTo}aa, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <NoCoverIcon className="h-8 w-8 text-white/40 sm:h-10 sm:w-10" />
        <p className="font-arcade text-sm text-white/70 sm:text-base">{game.title}</p>
        <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-white/40 sm:text-[10px]">
          Cover Coming Soon
        </p>
      </div>
    </div>
  )
}

function Badge({ label, tone }: { label: string; tone: 'engine' | 'genre' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest sm:text-[10px] ${
        tone === 'engine'
          ? 'border-arcade-amber/40 bg-black/30 text-arcade-amber'
          : 'border-arcade-cyan/40 bg-black/30 text-arcade-cyan'
      }`}
    >
      {label}
    </span>
  )
}

function GamePage() {
  const { slug: routeSlug } = useParams()

  const [game, setGame] = useState<GameViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const loadGame = useCallback(async () => {
    if (!routeSlug) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const data = await fetchGameBySlug(routeSlug)
      setGame({
        slug: data.slug,
        title: data.title,
        tagline: data.description || TAGLINE_PLACEHOLDER,
        engine: data.engine,
        genres: [GENRE_PLACEHOLDER],
        devComment: data.devComment,
        coverImage: data.coverImage,
        accentFrom: DEFAULT_ACCENT_FROM,
        accentTo: DEFAULT_ACCENT_TO,
      })
    } catch (err) {
      setGame(null)
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true)
        setError('This game does not exist or is no longer available.')
      } else {
        setError('Failed to load this game. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [routeSlug])

  useEffect(() => {
    loadGame()
  }, [loadGame])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-arcade-cyan sm:text-sm">
          Loading<span className="animate-pulse">_</span>
        </p>
        <p className="text-[11px] text-white/50 sm:text-xs">Fetching game data...</p>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-arcade text-lg text-arcade-magenta sm:text-xl">
          {notFound ? 'GAME NOT FOUND' : 'CONNECTION ERROR'}
        </p>
        <p className="max-w-xs text-[11px] leading-relaxed text-white/60 sm:text-xs">
          {error ?? 'Something went wrong while loading this game.'}
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-2.5">
          {!notFound && (
            <button
              type="button"
              onClick={loadGame}
              className="neon-btn-outline rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
            >
              Retry
            </button>
          )}
          <Link
            to="/"
            className="neon-btn-outline rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const hasCover = Boolean(game.coverImage)

  return (
    <div className="flex flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 md:px-8">
      <section className="flex flex-col items-center gap-5 text-center md:flex-row md:items-start md:gap-8 md:text-left">
        <div className="relative aspect-[3/4] w-44 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_24px_rgba(0,0,0,0.5)] sm:w-56 md:w-64">
          {hasCover ? (
            <img
              src={game.coverImage as string}
              alt={`${game.title} cover art`}
              className="h-full w-full object-cover"
            />
          ) : (
            <GameCoverPlaceholder game={game} />
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 md:items-start">
          <h1 className="bg-gradient-to-r from-arcade-magenta via-arcade-amber to-arcade-cyan bg-clip-text font-arcade text-2xl leading-tight text-transparent [text-shadow:3px_3px_0_rgba(0,0,0,0.4)] sm:text-3xl md:text-4xl">
            {game.title}
          </h1>
          <p className="max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">{game.tagline}</p>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <Badge label={game.engine} tone="engine" />
            {game.genres.map((genre) => (
              <Badge key={genre} label={genre} tone="genre" />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5 border-t border-white/10 pt-5">
        <div>
          <h2 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-arcade-cyan">
            <span className="mr-1.5 text-arcade-amber">&bull;</span>
            Developer Comment
          </h2>
          <div className="max-w-3xl space-y-3">
            <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
              {game.devComment || 'No developer notes have been added for this project yet.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center">
          <Link
            to={`/play/${game.slug}`}
            className="neon-btn-play flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-black"
          >
            <PlayIcon className="h-3 w-3" />
            Play Now
          </Link>
          <Link
            to="/"
            className="neon-btn-outline flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white/80"
          >
            &larr; Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}

export default GamePage