import { createBrowserRouter } from 'react-router-dom'
import ArcadeLayout from '../layouts/ArcadeLayout'
import HomePage from '../pages/HomePage'
import GamePage from '../pages/GamePage'
import NotFoundPage from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    element: <ArcadeLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/game/:slug', element: <GamePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router