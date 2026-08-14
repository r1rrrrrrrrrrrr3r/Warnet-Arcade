import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, fetchGameBySlug, type GameDetail } from '../lib/api'
import ArcadeRuntime, { type ArcadeRuntimeHandle, type RuntimeStatus } from '../runtime/ArcadeRuntime'

type BadgeTone = 'engine' | RuntimeStatus

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please return to the Game Page and try again.'
const NOT_FOUND_MESSAGE = 'This game could not be found. Please return to the Game Page and try again.'

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 1.2v9.6c0 .8.9 1.3 1.6.9l7.6-4.8a1 1 0 0 0 0-1.7L3.6.3C2.9-.1 2 .4 2 1.2Z" />
    </svg>
  )
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
    </svg>
  )
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 3 5 8l5 5" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
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
      <path d="M12 3.5 21.5 20h-19z" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  const toneClasses: Record<BadgeTone, string> = {
    engine: 'border-arcade-amber/40 bg-black/30 text-arcade-amber',
    ready: 'border-arcade-cyan/40 bg-black/30 text-arcade-cyan',
    loading: 'border-white/20 bg-black/30 text-white/70',
    error: 'border-red-500/40 bg-black/30 text-red-400',
  }
  const dotClasses: Record<BadgeTone, string> = {
    engine: '',
    ready: 'bg-arcade-cyan',
    loading: 'animate-pulse bg-white/70',
    error: 'bg-red-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest sm:text-[10px] ${toneClasses[tone]}`}
    >
      {tone !== 'engine' && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />}
      {label}
    </span>
  )
}

function PlayPage() {
  const { slug: routeSlug } = useParams()
  const gameSlug = routeSlug ?? 'unknown-game'
  const backTo = `/game/${gameSlug}`

  const runtimeRef = useRef<ArcadeRuntimeHandle>(null)

  const [game, setGame] = useState<GameDetail | null>(null)
  const [pageStatus, setPageStatus] = useState<RuntimeStatus>('loading')
  const [pageErrorMessage, setPageErrorMessage] = useState(DEFAULT_ERROR_MESSAGE)
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>('loading')

  const loadGame = useCallback(async () => {
    if (!routeSlug) return
    setPageStatus('loading')
    try {
      const data = await fetchGameBySlug(routeSlug)
      setGame(data)
      setRuntimeStatus('loading')
      setPageStatus('ready')
    } catch (err) {
      setGame(null)
      setPageErrorMessage(
        err instanceof ApiError && err.status === 404 ? NOT_FOUND_MESSAGE : DEFAULT_ERROR_MESSAGE
      )
      setPageStatus('error')
    }
  }, [routeSlug])

  useEffect(() => {
    loadGame()
  }, [loadGame])

  const handleFullscreen = () => {
    runtimeRef.current?.requestFullscreen()
  }

  const handlePlay = () => {
    if (pageStatus === 'error') {
      loadGame()
      return
    }
    runtimeRef.current?.reload()
  }

  const displayTitle = (game?.title ?? gameSlug.replace(/-/g, ' ')).toUpperCase()
  const displayStatus: RuntimeStatus = pageStatus === 'ready' ? runtimeStatus : pageStatus
  const statusLabel = displayStatus === 'loading' ? 'Loading' : displayStatus === 'error' ? 'Error' : 'Ready'

  return (
    <div className="flex h-full flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4 md:px-8">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <h1 className="font-arcade text-base text-arcade-magenta sm:text-lg md:text-xl">{displayTitle}</h1>
        <div className="flex items-center gap-2">
          {game && <Badge label={game.engine} tone="engine" />}
          <Badge label={statusLabel} tone={displayStatus} />
        </div>
      </div>

      <div className="relative min-h-[240px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-black sm:min-h-[340px]">
        {pageStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-arcade-cyan sm:text-sm">
              Loading<span className="animate-pulse">_</span>
            </p>
            <p className="text-[11px] text-white/50 sm:text-xs">Connecting to the arcade server...</p>
          </div>
        )}

        {pageStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <WarningIcon className="h-8 w-8 text-red-400" />
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-red-400 sm:text-sm">
              Failed To Load Game
            </p>
            <p className="max-w-xs text-[11px] leading-relaxed text-white/60 sm:text-xs">{pageErrorMessage}</p>
            <Link
              to={backTo}
              className="neon-btn-outline mt-1 rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
            >
              Back to Game Page
            </Link>
          </div>
        )}

        {pageStatus === 'ready' && game && (
          <ArcadeRuntime
            ref={runtimeRef}
            entryFile={game.entryFile}
            title={game.title}
            onStatusChange={setRuntimeStatus}
          />
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2.5 border-t border-white/10 pt-3 sm:justify-between">
        <Link
          to={backTo}
          className="neon-btn-outline flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
        >
          <BackIcon className="h-3 w-3" />
          Back
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleFullscreen}
            className="neon-btn-outline flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
          >
            <ExpandIcon className="h-3.5 w-3.5" />
            Fullscreen
          </button>
          <button
            type="button"
            onClick={handlePlay}
            className="neon-btn-play flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-wide text-black"
          >
            <PlayIcon className="h-2.5 w-2.5" />
            Play
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayPage