import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { useCabinet } from '../context/CabinetContext'

const particleVariants = ['particle-a', 'particle-b', 'particle-c']
const particleColors = ['#a855f7', '#22e5ff', '#ff2fb0']

function ArcadeLayout() {
  const monitorScrollRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const cabinet = useCabinet()

  const gameMatch = useMatch('/game/:slug')
  const playMatch = useMatch('/play/:slug')
  const activeSlug = gameMatch?.params.slug ?? playMatch?.params.slug ?? null
  const slot = activeSlug ? cabinet.slotFor(activeSlug) : null
  const roomLabel = playMatch ? 'Now Playing' : gameMatch ? 'Viewing' : 'Browsing'

  useEffect(() => {
    window.scrollTo(0, 0)
    monitorScrollRef.current?.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  const handleHome = () => navigate('/')

  const deckActions = [
    { letter: 'B', title: 'Go back', color: '#ff4d4d', onClick: () => navigate(-1) },
    {
      letter: 'R',
      title: 'Random game',
      color: '#ffb020',
      onClick: () => {
        const slug = cabinet.randomSlug(activeSlug ?? undefined)
        if (slug) navigate(`/game/${slug}`)
      },
      disabled: cabinet.games.length === 0,
    },
    {
      letter: 'F',
      title: 'Fullscreen',
      color: '#22e5ff',
      onClick: () => cabinet.requestFullscreen(),
      disabled: !playMatch,
    },
  ]

  return (
    <div className="arcade-stage relative h-screen w-screen overflow-hidden">
      <div className="arcade-stars" aria-hidden="true" />

      <div
        className="glow-breathe pointer-events-none absolute left-1/2 top-[-8%] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-arcade-purple/25 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="glow-breathe pointer-events-none absolute bottom-[-8%] right-[-5%] h-[380px] w-[380px] rounded-full bg-arcade-cyan/15 blur-[100px]"
        style={{ animationDelay: '1.5s' }}
        aria-hidden="true"
      />
      <div
        className="glow-breathe pointer-events-none absolute bottom-[8%] left-[-5%] h-[320px] w-[320px] rounded-full bg-arcade-magenta/15 blur-[100px]"
        style={{ animationDelay: '3s' }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className={`particle ${particleVariants[i % particleVariants.length]}`}
            style={{
              left: `${(i * 37) % 100}%`,
              color: particleColors[i % particleColors.length],
              animationDelay: `${(i % 9) * 0.9}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full items-center justify-center p-1 sm:p-2 lg:p-3">
        <div className="cabinet flex h-full w-[94vw] sm:w-[93vw] md:w-[92vw] lg:w-[91vw] xl:w-[90vw] 2xl:w-[min(89vw,1840px)] flex-col gap-1.5 p-1.5 sm:gap-2 sm:p-2 lg:p-2.5">
          <div
            className="cabinet-edge-light absolute left-1.5 bg-gradient-to-b from-transparent via-arcade-cyan to-transparent"
            aria-hidden="true"
          />
          <div
            className="cabinet-edge-light absolute right-1.5 bg-gradient-to-b from-transparent via-arcade-magenta to-transparent"
            aria-hidden="true"
          />

          <div className="header-bar relative shrink-0 rounded-[1.75rem] px-3 py-1 sm:px-5 sm:py-1.5">
            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
              <div className="speaker-grille hidden h-7 w-7 shrink-0 lg:block" aria-hidden="true" />

              <div className="hidden w-28 shrink-0 flex-col gap-0.5 sm:flex">
                <div className="stat-box px-2.5 py-0.5">
                  <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-magenta">
                    Library
                  </p>
                  <p className="font-display text-base font-bold text-white">
                    {cabinet.gamesLoading ? '...' : String(cabinet.games.length).padStart(2, '0')}
                  </p>
                </div>
                <div className="stat-divider" />
                <div className="stat-box px-2.5 py-0.5">
                  <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-cyan">
                    Status
                  </p>
                  <p className={`font-display text-base font-bold ${cabinet.apiOnline ? 'text-white' : 'text-red-400'}`}>
                    {cabinet.apiOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex-1 text-center">
                <h1 className="marquee-title text-2xl text-arcade-magenta sm:text-3xl md:text-4xl">WARNET</h1>
                <h1 className="marquee-title -mt-1 text-2xl text-arcade-cyan sm:-mt-1.5 sm:text-3xl md:text-4xl">
                  ARCADE
                </h1>
                <p className="mt-0.5 font-display text-[9px] font-semibold uppercase tracking-[0.3em] text-arcade-amber sm:text-[11px]">
                  Insert Coin &bull; Press Start
                </p>
              </div>

              <div className="hidden w-28 shrink-0 flex-col gap-0.5 text-right sm:flex">
                <div className="stat-box px-2.5 py-0.5">
                  <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-cyan">
                    Player One
                  </p>
                  <p className="font-display text-base font-bold text-arcade-cyan">{roomLabel}</p>
                </div>
                <div className="stat-divider" />
                <div className="stat-box px-2.5 py-0.5">
                  <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-amber">
                    Slot
                  </p>
                  <p className="font-display text-base font-bold text-white">
                    {slot ? `${slot.index}/${slot.total}` : '--'}
                  </p>
                </div>
              </div>

              <div className="speaker-grille hidden h-7 w-7 shrink-0 lg:block" aria-hidden="true" />
            </div>
          </div>

          <div className="monitor-bezel min-h-0 flex-1 rounded-2xl p-1 sm:p-1.5">
            <div className="monitor-screen h-full rounded-2xl">
              <div className="monitor-scroll h-full" ref={monitorScrollRef}>
                <Outlet />
              </div>

              <div className="crt-overlay">
                <div className="crt-scanlines" />
                <div className="crt-reflection" />
                <div className="crt-vignette" />
                <div className="crt-flicker" />
              </div>
            </div>
          </div>

          <div className="control-deck hidden shrink-0 items-center justify-between gap-3 rounded-2xl px-4 py-1.5 sm:py-2 md:flex">
            <div className="flex items-end gap-4">
              <div className="relative h-9 w-9 shrink-0">
                <div className="joystick-base absolute inset-0" aria-hidden="true" />
                <div className="joystick-gate absolute inset-[18%]" aria-hidden="true" />
                <div
                  className="joystick-shaft absolute left-1/2 top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-full -rotate-6"
                  aria-hidden="true"
                />
                <div
                  className="joystick-ball absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-[80%] -rotate-6"
                  aria-hidden="true"
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {deckActions.map((action) => (
                  <button
                    key={action.letter}
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    title={action.title}
                    aria-label={action.title}
                    className="arcade-button relative flex h-6 w-6 items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-30"
                    style={{ backgroundColor: action.color, color: action.color }}
                  >
                    <span className="relative z-10 font-display text-[10px] font-bold text-black/70">
                      {action.letter}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <div className="led-panel rounded-md px-2.5 py-1 text-center">
                <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-amber">
                  Slot
                </p>
                <p className="font-mono text-base font-bold text-arcade-amber">
                  {slot ? `${slot.index}/${slot.total}` : '--'}
                </p>
              </div>
              <div className="led-panel rounded-md px-2.5 py-1">
                <p className="font-display text-[11px] font-semibold uppercase tracking-widest text-arcade-cyan">
                  {cabinet.apiOnline ? 'System Online' : 'System Offline'}
                </p>
                <p className="font-display text-[9px] uppercase tracking-widest text-white/40">
                  {cabinet.gamesLoading ? 'Syncing library...' : `${cabinet.games.length} games loaded`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={handleHome} title="Return to the home screen" aria-label="Return home" className="text-center">
                <div
                  className="eject-button glow-breathe mx-auto h-5 w-5 transition hover:brightness-125"
                  aria-hidden="true"
                />
                <p className="mt-0.5 font-display text-[8px] font-semibold uppercase tracking-widest text-white/50">
                  Eject &bull; Home
                </p>
              </button>
              <div className="hidden flex-col gap-0.5 rounded-md border border-white/10 bg-black/30 px-2.5 py-1 xl:flex">
                <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-magenta">
                  How To Play
                </p>
                <p className="text-[9px] text-white/50">Insert coin &bull; Press start &bull; Pick a game</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArcadeLayout