import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { fetchGames, type GameSummary } from '../lib/api'

interface GameSlot {
  index: number
  total: number
}

interface CabinetContextValue {
  games: GameSummary[]
  gamesLoading: boolean
  apiOnline: boolean
  slotFor: (slug: string) => GameSlot | null
  randomSlug: (excludeSlug?: string) => string | null
  registerFullscreenHandler: (handler: (() => void) | null) => void
  requestFullscreen: () => void
}

const CabinetContext = createContext<CabinetContextValue | null>(null)

export function CabinetProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<GameSummary[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(true)
  const fullscreenHandlerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchGames()
      .then((list) => {
        if (cancelled) return
        setGames(list)
        setApiOnline(true)
      })
      .catch(() => {
        if (cancelled) return
        setApiOnline(false)
      })
      .finally(() => {
        if (!cancelled) setGamesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const slotFor = useCallback(
    (slug: string): GameSlot | null => {
      if (games.length === 0) return null
      const index = games.findIndex((game) => game.slug === slug)
      if (index === -1) return null
      return { index: index + 1, total: games.length }
    },
    [games]
  )

  const randomSlug = useCallback(
    (excludeSlug?: string): string | null => {
      if (games.length === 0) return null
      const pool = excludeSlug ? games.filter((game) => game.slug !== excludeSlug) : games
      const source = pool.length > 0 ? pool : games
      return source[Math.floor(Math.random() * source.length)].slug
    },
    [games]
  )

  const registerFullscreenHandler = useCallback((handler: (() => void) | null) => {
    fullscreenHandlerRef.current = handler
  }, [])

  const requestFullscreen = useCallback(() => {
    fullscreenHandlerRef.current?.()
  }, [])

  const value = useMemo<CabinetContextValue>(
    () => ({
      games,
      gamesLoading,
      apiOnline,
      slotFor,
      randomSlug,
      registerFullscreenHandler,
      requestFullscreen,
    }),
    [games, gamesLoading, apiOnline, slotFor, randomSlug, registerFullscreenHandler, requestFullscreen]
  )

  return <CabinetContext.Provider value={value}>{children}</CabinetContext.Provider>
}

export function useCabinet(): CabinetContextValue {
  const ctx = useContext(CabinetContext)
  if (!ctx) {
    throw new Error('useCabinet must be used within a CabinetProvider')
  }
  return ctx
}