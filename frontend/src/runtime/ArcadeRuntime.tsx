import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export type RuntimeStatus = 'loading' | 'ready' | 'error'

export interface ArcadeRuntimeHandle {
  requestFullscreen: () => void
  reload: () => void
}

interface ArcadeRuntimeProps {
  entryFile: string
  title: string
  onStatusChange?: (status: RuntimeStatus) => void
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
  ({ entryFile, title, onStatusChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<RuntimeStatus>('loading')
    const [validated, setValidated] = useState(false)
    const [attempt, setAttempt] = useState(0)

    const updateStatus = (next: RuntimeStatus) => {
      setStatus(next)
      onStatusChange?.(next)
    }

    useEffect(() => {
      let cancelled = false
      setValidated(false)
      updateStatus('loading')

      fetch(entryFile, { method: 'HEAD' })
        .then((response) => {
          if (cancelled) return
          if (response.ok) {
            setValidated(true)
          } else {
            updateStatus('error')
          }
        })
        .catch(() => {
          if (!cancelled) {
            updateStatus('error')
          }
        })

      return () => {
        cancelled = true
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryFile, attempt])

    useImperativeHandle(ref, () => ({
      requestFullscreen: async () => {
        const el = containerRef.current
        if (!el) return

        if (!document.fullscreenElement) {
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

    return (
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black"
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
            className="block h-full w-full border-0"
            allow="fullscreen; autoplay"
            onLoad={() => updateStatus('ready')}
            onError={() => updateStatus('error')}
          />
        )}

        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-arcade-cyan sm:text-sm">
              Loading Game<span className="animate-pulse">...</span>
            </p>
            <p className="text-[11px] text-white/50 sm:text-xs">Preparing Arcade Machine...</p>
            <p className="font-mono text-sm tracking-widest text-arcade-cyan sm:text-base">████████░░</p>
          </div>
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
      </div>
    )
  }
)

ArcadeRuntime.displayName = 'ArcadeRuntime'

export default ArcadeRuntime