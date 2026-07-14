import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="p-4 bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Community Photo Board</Link>
          <Link to="/login" className="text-sm font-medium hover:underline px-4 py-2 bg-slate-900 text-white rounded-md">Login</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-4 pt-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
