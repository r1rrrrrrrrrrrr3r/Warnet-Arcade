# Documentation

Index of everything documented for WarnetArcade. Start with the root [`README.md`](../README.md) for setup, this page just maps out where each topic lives.

## Setup

| Topic | Where |
|---|---|
| Prerequisites & installation | [`README.md` — Prerequisites](../README.md#prerequisites), [Installation](../README.md#installation) |
| Backend setup & dev server | [`README.md` — Backend Setup](../README.md#backend-setup) |
| Frontend setup & dev server | [`README.md` — Frontend Setup](../README.md#frontend-setup) |
| Database setup (Prisma + SQLite) | [`README.md` — Database Setup](../README.md#database-setup) |

## Development commands

| Command | Where it runs | What it does |
|---|---|---|
| `npm run dev` | `backend/` | `tsx watch src/server.ts`, Fastify API on `:3000` |
| `npm run dev` | `frontend/` | Vite dev server, proxies `/games` to `:3000` |
| `npm run build` | `frontend/` | `tsc -b && vite build` → `frontend/dist` |
| `npm run preview` | `frontend/` | Serves the production build locally |
| `npm run lint` | `frontend/` | ESLint |
| `npx prisma migrate dev` | `backend/` | Applies migrations, auto-seeds on first run |
| `npx prisma db seed` | `backend/` | Re-runs `prisma/seed.ts` (wipes and reseeds `Game` rows) |
| `npx prisma studio` | `backend/` | GUI for browsing/editing the database directly |

## Content

| Topic | Where |
|---|---|
| Adding a game (DB row, fields, `engine` behavior) | [`README.md` — Adding a Game](../README.md#adding-a-game) |
| Packaging a Scratch/TurboWarp game | [`GAME_PACKAGING.md` — Scratch](./GAME_PACKAGING.md#packaging-scratch-via-turbowarp-packager) |
| Packaging a Unity WebGL game | [`GAME_PACKAGING.md` — Unity](./GAME_PACKAGING.md#packaging-unity-webgl) |
| Packaging a C++/Emscripten game | [`GAME_PACKAGING.md` — Emscripten](./GAME_PACKAGING.md#packaging-c--emscripten) |
| Pre-publish checklist | [`GAME_PACKAGING.md` — checklist](./GAME_PACKAGING.md#pre-publish-checklist) |

## Known gaps

Worth knowing before you rely on these areas:

- **No admin/write API.** Games are added by hand via `prisma/seed.ts` or `npx prisma studio`, there's no `POST /games` route.
- **No production build for the backend.** Only `tsx watch` exists today; a `build`/`start` script needs to be added before deploying.
- **`prisma db seed` is destructive.** It calls `deleteMany()` on `Game` before inserting, so it always replaces the full table rather than adding to it.