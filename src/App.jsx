import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="p-4 bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Community Photo Board</Link>
          <Link to="/login" className="text-sm font-medium hover:underline">Login</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<div>Feed</div>} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
