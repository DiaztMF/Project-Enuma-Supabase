import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Search from './pages/Search'
import Explore from './pages/Explore'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import { Home, Search as SearchIcon, Compass, MessageCircle, Heart, PlusSquare, User, LogOut } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const username = user?.email?.split('@')[0] || 'profil'

  return (
    <div className="min-h-screen bg-ig-black text-ig-text flex">
      {/* Left Fixed Sidebar */}
      <aside className="w-16 md:w-60 h-screen border-r border-ig-border bg-white fixed top-0 left-0 flex flex-col justify-between p-3 md:p-6 z-30">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="block py-4">
            <h1 className="text-xl font-bold font-serif md:block hidden tracking-wide bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Community Board
            </h1>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 md:hidden flex items-center justify-center font-bold text-white text-xs">
              CB
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-2">
            <Link to="/" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
              <Home className="w-6 h-6" />
              <span className="text-sm font-medium md:inline hidden">Beranda</span>
            </Link>
            
            <Link to="/search" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
              <SearchIcon className="w-6 h-6" />
              <span className="text-sm font-medium md:inline hidden">Cari</span>
            </Link>

            <Link to="/explore" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
              <Compass className="w-6 h-6" />
              <span className="text-sm font-medium md:inline hidden">Jelajahi</span>
            </Link>

            <Link to="/messages" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-medium md:inline hidden">Pesan</span>
            </Link>

            <Link to="/notifications" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
              <Heart className="w-6 h-6" />
              <span className="text-sm font-medium md:inline hidden">Notifikasi</span>
            </Link>

            {user ? (
              <Link to="/?create=true" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
                <PlusSquare className="w-6 h-6 text-ig-blue" />
                <span className="text-sm font-bold text-ig-blue md:inline hidden">Buat</span>
              </Link>
            ) : (
              <Link to="/login" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
                <PlusSquare className="w-6 h-6 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-500 md:inline hidden">Buat</span>
              </Link>
            )}

            {user && (
              <Link to={`/profile/${username}`} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
                <User className="w-6 h-6" />
                <span className="text-sm font-medium md:inline hidden truncate">@{username}</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Auth Button at bottom */}
        <div>
          {user ? (
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer text-left active:scale-[0.98]"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-sm font-medium md:inline hidden">Keluar</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-100 transition-colors active:scale-[0.98]">
              <LogOut className="w-6 h-6" />
              <span className="text-sm font-medium md:inline hidden">Masuk</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Container Workspace */}
      <main className="flex-1 min-h-screen ml-16 md:ml-60 flex justify-center p-4 md:p-8 overflow-hidden">
        <Routes>
          <Route path="/" element={<Feed user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/messages" element={<Messages user={user} />} />
          <Route path="/notifications" element={<Notifications user={user} />} />
          <Route path="/profile/:username" element={<Profile user={user} />} />
        </Routes>
      </main>
    </div>
  )
}
