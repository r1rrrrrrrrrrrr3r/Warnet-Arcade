import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4 py-12 text-center sm:gap-5 sm:px-6">
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-arcade-amber sm:text-xs">
        <span className="mr-1.5 animate-pulse text-arcade-magenta">&bull;</span>
        System Error
      </p>

      <h1 className="bg-gradient-to-r from-arcade-magenta via-arcade-amber to-arcade-cyan bg-clip-text font-arcade text-6xl leading-none text-transparent [text-shadow:4px_4px_0_rgba(0,0,0,0.4)] sm:text-7xl md:text-8xl">
        404
      </h1>

      <h2 className="font-arcade text-lg text-arcade-cyan sm:text-xl md:text-2xl">
        GAME NOT FOUND
      </h2>

      <p className="max-w-sm text-xs leading-relaxed text-white/70 sm:text-sm">
        The page you're looking for doesn't exist or may have been moved.
        <br />
        Return to the arcade and choose another game.
      </p>

      <Link
        to="/"
        className="neon-btn-play mt-2 flex items-center gap-1.5 rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-black sm:text-sm"
      >
        Return Home
      </Link>

      <p className="mt-2 font-display text-[9px] font-semibold uppercase tracking-widest text-white/40 sm:text-[10px]">
        Insert Coin <span className="animate-pulse text-arcade-amber">&bull;</span> Press Start
      </p>
    </div>
  )
}

export default NotFoundPage