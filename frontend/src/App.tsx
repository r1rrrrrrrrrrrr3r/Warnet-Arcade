import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="bg-gray-900 min-h-screen text-white p-8">Halaman Utama GameHub</div>} />
        <Route path="/play/:slug" element={<div className="bg-black min-h-screen text-white p-8">Halaman Player</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App