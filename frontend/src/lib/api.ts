const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface GameSummary {
  id: number
  title: string
  slug: string
  coverImage: string | null
  engine: string
}

export interface GameDetail extends GameSummary {
  description: string
  howToPlay: string
  devComment: string
  entryFile: string
  featured: boolean
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path || path.trim() === '') return null
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status)
  }

  return response.json() as Promise<T>
}

interface RawGameSummary {
  id: number
  title: string
  slug: string
  coverImage: string
  engine: string
}

interface RawGameDetail extends RawGameSummary {
  description: string
  howToPlay: string
  devComment: string
  entryFile: string
  featured: boolean
}

export async function fetchGames(): Promise<GameSummary[]> {
  const games = await request<RawGameSummary[]>('/games')
  return games.map((game) => ({
    ...game,
    coverImage: resolveAssetUrl(game.coverImage),
  }))
}

export async function fetchGameBySlug(slug: string): Promise<GameDetail> {
  const game = await request<RawGameDetail>(`/games/${slug}`)
  return {
    ...game,
    coverImage: resolveAssetUrl(game.coverImage),
    entryFile: resolveAssetUrl(game.entryFile) ?? game.entryFile,
  }
}