import { Link, useParams } from 'react-router-dom'

interface GameDetail {
  slug: string
  title: string
  tagline: string
  engine: string
  genres: string[]
  description: string[]
  coverImage?: string | null
  accentFrom: string
  accentTo: string
}

const dummyGames: Record<string, GameDetail> = {
  barathrum: {
    slug: 'barathrum',
    title: 'Barathrum',
    tagline: 'A turn-based roguelite adventure through mysterious underground ruins.',
    engine: 'Unity WebGL',
    genres: ['Roguelite', 'Turn-Based', 'Pixel Art'],
    description: [
      'Barathrum drops you into a collapsing underworld where every corridor hides a new threat and every choice reshapes the run ahead. Explore hand-crafted ruins, uncover forgotten relics, and piece together the fate of the civilization that once thrived below.',
      'Combat unfolds in tense, turn-based encounters that reward careful positioning over twitch reflexes. Chain together abilities, exploit enemy weaknesses, and manage a limited supply of resources as you push deeper into the dark.',
      'No two descents are the same. Procedurally arranged chambers, shifting hazards, and a growing roster of unlockable classes keep each attempt fresh, whether you\u2019re diving for the first time or chasing a new personal best.',
    ],
    coverImage: null,
    accentFrom: '#ff2fb0',
    accentTo: '#ffb020',
  },
  'night-drifter': {
    slug: 'night-drifter',
    title: 'Night Drifter',
    tagline: 'Outrun the neon night in high-stakes street races through a city that never sleeps.',
    engine: 'Unity WebGL',
    genres: ['Racing', 'Arcade', 'Neon'],
    description: [
      'Night Drifter puts you behind the wheel of a tuned-up street machine, weaving through rain-slicked highways and neon-drenched back alleys.',
      'Drift through hairpin turns, dodge traffic, and chase down rivals in time trials built for quick, adrenaline-fueled runs.',
    ],
    coverImage: null,
    accentFrom: '#22e5ff',
    accentTo: '#7c1fd6',
  },
  'pixel-dungeon': {
    slug: 'pixel-dungeon',
    title: 'Pixel Dungeon',
    tagline: 'A charming pixel-art dungeon crawl full of secrets, traps, and forgotten treasure.',
    engine: 'Godot WebGL',
    genres: ['Adventure', 'Pixel Art', 'Puzzle'],
    description: [
      'Pixel Dungeon sends you crawling through hand-drawn chambers stacked with puzzles, traps, and long-buried loot.',
      'Every floor hides a new layout and a new mystery, rewarding careful exploration over brute force.',
    ],
    coverImage: null,
    accentFrom: '#ffb020',
    accentTo: '#7c1fd6',
  },
  'neon-strike': {
    slug: 'neon-strike',
    title: 'Neon Strike',
    tagline: "Bullet-soaked arcade mayhem where every second counts and every hit chains your score.",
    engine: 'Unity WebGL',
    genres: ["Shoot 'Em Up", 'Arcade', 'Score Attack'],
    description: [
      "Neon Strike is a fast, unforgiving shoot 'em up where the screen fills with bullets and the only way out is through.",
      'Weave through dense enemy patterns, chain combos, and chase the top of the leaderboard one run at a time.',
    ],
    coverImage: null,
    accentFrom: '#ff2fb0',
    accentTo: '#a855f7',
  },
  'mecha-core': {
    slug: 'mecha-core',
    title: 'Mecha Core',
    tagline: 'Pilot a customizable war machine through shattered battlefields in fast, brutal 3D combat.',
    engine: 'Unity WebGL',
    genres: ['Action', 'Mech Combat', '3D'],
    description: [
      'Mecha Core drops you into the cockpit of a heavily armed mech built for close-quarters destruction.',
      'Swap loadouts between missions and take on increasingly hostile battlefields across a shattered warzone.',
    ],
    coverImage: null,
    accentFrom: '#ffb020',
    accentTo: '#ff8a1f',
  },
  'void-walker': {
    slug: 'void-walker',
    title: 'Void Walker',
    tagline: 'Scavenge, craft, and survive alone on a hostile world at the edge of known space.',
    engine: 'Unity WebGL',
    genres: ['Survival', 'Sci-Fi', 'Exploration'],
    description: [
      'Void Walker strands you on a hostile, resource-starved world with nothing but your wits and a failing suit.',
      'Scavenge the wreckage, craft what you need, and survive long enough to find a way off-world.',
    ],
    coverImage: null,
    accentFrom: '#a855f7',
    accentTo: '#22e5ff',
  },
}

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

function GameCoverPlaceholder({ game }: { game: GameDetail }) {
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
  const game: GameDetail = dummyGames[routeSlug ?? ''] ?? dummyGames.barathrum
  const hasCover = Boolean(game.coverImage && game.coverImage.trim() !== '')

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
            About This Game
          </h2>
          <div className="max-w-3xl space-y-3">
            {game.description.map((paragraph, index) => (
              <p key={index} className="text-xs leading-relaxed text-white/70 sm:text-sm">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <div className="stat-box px-2.5 py-1.5">
            <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-magenta">
              Players
            </p>
            <p className="font-display text-sm font-bold text-white">1-4 Players</p>
          </div>
          <div className="stat-box px-2.5 py-1.5">
            <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-cyan">
              Difficulty
            </p>
            <p className="font-display text-sm font-bold text-white">Nightmare</p>
          </div>
          <div className="stat-box px-2.5 py-1.5">
            <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-amber">
              Playtime
            </p>
            <p className="font-display text-sm font-bold text-white">6-10 Hours</p>
          </div>
          <div className="stat-box px-2.5 py-1.5">
            <p className="font-display text-[9px] font-semibold uppercase tracking-widest text-arcade-cyan">
              Status
            </p>
            <p className="font-display text-sm font-bold text-white">Now Playing</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => console.log(`Play requested for ${game.slug}`)}
            className="neon-btn-play flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-black"
          >
            <PlayIcon className="h-3 w-3" />
            Play Now
          </button>
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