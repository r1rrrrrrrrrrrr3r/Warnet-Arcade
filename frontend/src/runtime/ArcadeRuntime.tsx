import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import LoadingScreen from '../components/LoadingScreen'

export type RuntimeStatus = 'loading' | 'ready' | 'error'

export interface ArcadeRuntimeHandle {
  requestFullscreen: () => void
  reload: () => void
}

interface ArcadeRuntimeProps {
  entryFile: string
  title: string
  onStatusChange?: (status: RuntimeStatus) => void
  lockRenderResolution?: boolean
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

const ArcadeRuntime = forwardRef<ArcadeRuntimeHandle, ArcadeRuntimeProps>(
  ({ entryFile, title, onStatusChange, lockRenderResolution = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<RuntimeStatus>('loading')
    const [validated, setValidated] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [fullscreenScale, setFullscreenScale] = useState(1)

    const lockedRenderSizeRef = useRef<{ width: number; height: number } | null>(null)

    const updateStatus = (next: RuntimeStatus) => {
      setStatus(next)
      onStatusChange?.(next)
    }

    const recalcFullscreenScale = () => {
      const el = containerRef.current
      const locked = lockedRenderSizeRef.current
      if (!el || !locked || locked.width === 0 || locked.height === 0) return
      const scale = Math.min(el.clientWidth / locked.width, el.clientHeight / locked.height)
      setFullscreenScale(scale > 0 ? scale : 1)
    }

    useEffect(() => {
      let cancelled = false
      setValidated(false)
      updateStatus('loading')

      fetch(entryFile, { method: 'HEAD', cache: 'no-store' })
        .then((response) => {
          if (cancelled) return
          if (response.ok) {
            setValidated(true)
          } else {
            console.error(
              `ArcadeRuntime: entry file check failed for "${entryFile}" (HTTP ${response.status})`
            )
            updateStatus('error')
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error(`ArcadeRuntime: entry file check errored for "${entryFile}"`, err)
            updateStatus('error')
          }
        })

      return () => {
        cancelled = true
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryFile, attempt])

    useEffect(() => {
      const handleFullscreenChange = () => {
        const active = document.fullscreenElement === containerRef.current
        setIsFullscreen(active)
        if (active && lockRenderResolution) recalcFullscreenScale()
      }
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lockRenderResolution])

    useEffect(() => {
      if (!isFullscreen || !lockRenderResolution) return
      window.addEventListener('resize', recalcFullscreenScale)
      return () => window.removeEventListener('resize', recalcFullscreenScale)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFullscreen, lockRenderResolution])

    useImperativeHandle(ref, () => ({
      requestFullscreen: async () => {
        const el = containerRef.current
        if (!el) return

        if (!document.fullscreenElement) {
          if (lockRenderResolution) {
            const rect = el.getBoundingClientRect()
            lockedRenderSizeRef.current = { width: rect.width, height: rect.height }
          }

          if (el.requestFullscreen) {
            try {
              await el.requestFullscreen()
            } catch (err) {
              console.error('Failed to enter fullscreen', err)
            }
          } else {
            console.warn('Fullscreen API is not supported in this browser')
          }
        } else if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      },
      reload: () => {
        setAttempt((count) => count + 1)
      },
    }))

    const locked = lockedRenderSizeRef.current
    const useLockedSize = isFullscreen && lockRenderResolution && locked !== null

    return (
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(168,85,247,0.12), transparent 65%)' }}
          aria-hidden="true"
        />

        {validated && (
          <iframe
            key={`${entryFile}-${attempt}`}
            src={entryFile}
            title={title}
            allow="fullscreen; autoplay"
            scrolling="no"
            onLoad={() => updateStatus('ready')}
            onError={() => updateStatus('error')}
            className={useLockedSize ? 'block border-0' : 'block h-full w-full border-0'}
            style={
              useLockedSize && locked
                ? {
                    width: locked.width,
                    height: locked.height,
                    transform: `scale(${fullscreenScale})`,
                    transformOrigin: 'center center',
                    overflow: 'hidden',
                  }
                : { overflow: 'hidden' }
            }
          />
        )}

        {status === 'loading' && (
          <LoadingScreen title="Loading Game" subtitle="Preparing Arcade Machine..." variant="overlay" />
        )}

        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/90 px-6 text-center">
            <WarningIcon className="h-8 w-8 text-red-400" />
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-red-400 sm:text-sm">
              Failed To Load Game
            </p>
            <p className="max-w-xs text-[11px] leading-relaxed text-white/60 sm:text-xs">
              The selected game could not be started. Please try again.
            </p>
          </div>
        )}

        {!isFullscreen && (
          <div className="crt-overlay">
            <div className="crt-scanlines" />
            <div className="crt-reflection" />
            <div className="crt-vignette" />
            <div className="crt-flicker" />
          </div>
        )}
      </div>
    )
  }
)

ArcadeRuntime.displayName = 'ArcadeRuntime'

export default ArcadeRuntime