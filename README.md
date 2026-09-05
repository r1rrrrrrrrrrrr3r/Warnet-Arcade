# WarnetArcade

A browser arcade cabinet that serves a library of small games (Scratch, Unity WebGL, C++/Emscripten) through a Fastify API and a React frontend styled as a CRT cabinet.

## Tech Stack

- **Backend**: Fastify 5, Prisma 6, SQLite, TypeScript
- **Frontend**: React 19, React Router 7, Vite 8, Tailwind CSS

## Project Structure

```
.
├── backend/    Fastify API + Prisma schema and migrations
├── frontend/   React + Vite client
└── games/      Static game builds, served at /games/* (create this at the repo root if it doesn't exist yet)
```

## Prerequisites

- Node.js 20.19+ (Vite 8 requires this)
- npm

## Installation

```bash
git clone <this-repo>
cd <this-repo>

cd backend
npm install

cd ../frontend
npm install
```

## Database Setup

The backend uses SQLite through Prisma. Prisma reads the connection string from `DATABASE_URL`, which isn't committed (see `backend/.gitignore`), so create it yourself:

```bash
cd backend
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env
```

Then apply migrations:

```bash
npx prisma migrate dev
```

`prisma.config.ts` registers `tsx prisma/seed.ts` as the seed command, so `prisma migrate dev` seeds the database automatically the first time it creates the schema. To reseed manually at any point:

```bash
npx prisma db seed
```

**Heads up**: `prisma/seed.ts` starts with `prisma.game.deleteMany()`, so reseeding wipes every existing `Game` row and replaces it with whatever is hardcoded in that file. Don't run it against data you want to keep without backing it up first (e.g. via `npx prisma studio`).

To browse or hand-edit rows directly:

```bash
npx prisma studio
```

## Backend Setup

```bash
cd backend
npm run dev
```

This runs `tsx watch src/server.ts`, listening on `0.0.0.0:3000`. It exposes:

- `GET /games` — published games (summary fields only)
- `GET /games/:slug` — full detail for one published game
- `GET /games/*` — static files from the repo-root `games/` folder (covers, entry HTML, and any other assets a game needs)

There's currently no build/start script for production, only the `tsx watch` dev command. If you need a production build, you'll want to add a `build` step (e.g. `tsc` since the project already has `strict: true` and `module: NodeNext`) and a `start` script before deploying.

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm run dev
```

`.env` should contain `VITE_API_URL`, pointing at the backend (`http://localhost:3000` by default). The Vite dev server also proxies `/games` to `http://localhost:3000` (see `vite.config.ts`), so images and entry files resolve correctly even without `VITE_API_URL` during local dev.

Other frontend commands:

```bash
npm run build     # tsc -b && vite build, outputs to frontend/dist
npm run preview   # serve the production build locally
npm run lint      # eslint
```

## Adding a Game

There's no admin UI or write API yet, every `Game` row is created by hand (via `prisma/seed.ts` or `npx prisma studio`). The workflow:

1. **Package the game** (see [`GAME_PACKAGING.md`](./docs/GAME_PACKAGING.md) for the Scratch/Unity/Emscripten specifics) and drop the output into `games/<slug>/` at the repo root, e.g. `games/my-game/index.html`, `games/my-game/cover.png`, plus any other assets the build needs.
2. **Add a `Game` row** with these fields:
   - `title`, `slug` (must be unique, used in URLs)
   - `description`, `howToPlay`, `devComment` (all support the `**bold**` and `{{cyan}}...{{/cyan}}` / `{{amber}}...{{/amber}}` / `{{magenta}}...{{/magenta}}` inline markup that `RichText` renders)
   - `coverImage`: `/games/<slug>/cover.png`
   - `entryFile`: `/games/<slug>/index.html`
   - `engine`: free text shown as a badge, **except** it's also pattern-matched (`/scratch|turbowarp/i`, case-insensitive substring) by the frontend to decide whether to lock the player to a fixed 4:3 stage. Use `"Scratch"` for anything exported from Scratch/TurboWarp; anything else renders full-bleed and responsive.
   - `featured`: whether it's eligible for the homepage hero carousel
   - `published`: must be `true` for the game to show up at all, both routes filter on it
3. **Verify** the entry file loads directly at `http://localhost:3000/games/<slug>/index.html` with the backend running, before wiring up the DB row.

## Further Reading

- [`GAME_PACKAGING.md`](./docs/GAME_PACKAGING.md) — exact packaging steps for Scratch, Unity, and C++/Emscripten games