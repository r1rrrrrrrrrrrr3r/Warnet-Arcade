import { Link } from 'react-router-dom'

interface GameCardProps {
  slug: string
  title: string
  engine: string
}

function GameCard({ slug, title, engine }: GameCardProps) {
  return (
    <Link
      to={`/game/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 transition duration-200 hover:-translate-y-1 hover:border-purple-400/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute bottom-3 right-3 rounded-full border border-cyan-300/30 bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] text-cyan-300 opacity-0 transition group-hover:opacity-100">
          PLAY ▸
        </span>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-white/10 p-4">
        <h3 className="truncate text-sm font-semibold text-white md:text-base">{title}</h3>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-wide text-zinc-400">
          {engine}
        </span>
      </div>
    </Link>
  )
}

export default GameCard