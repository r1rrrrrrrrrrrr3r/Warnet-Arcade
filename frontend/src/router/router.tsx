import { createBrowserRouter } from 'react-router-dom'
import ArcadeLayout from '../layouts/ArcadeLayout'
import HomePage from '../pages/HomePage'
import GamePage from '../pages/GamePage'
import PlayPage from '../pages/PlayPage'
import NotFoundPage from '../pages/NotFoundPage'
import { CabinetProvider } from '../context/CabinetContext'

const router = createBrowserRouter([
  {
    element: (
      <CabinetProvider>
        <ArcadeLayout />
      </CabinetProvider>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/game/:slug', element: <GamePage /> },
      { path: '/play/:slug', element: <PlayPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router