import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Feed from './pages/Feed'
import { LogOut } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text selection:bg-editorial-accent/10">
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-40 px-4 md:px-6">
        <div className="max-w-6xl mx-auto h-full flex justify-between items-center">
          <Link to="/" className="text-xl font-bold font-serif tracking-tight text-editorial-text hover:opacity-85 transition-opacity">
            Community Photo Board
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-zinc-500 hidden sm:inline">
                  @{user.email?.split('@')[0]}
                </span>
                <Link 
                  to="/?create=true"
                  className="text-sm font-medium px-4 py-2 bg-editorial-accent text-white rounded-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer font-sans"
                >
                  + Post Foto
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md active:scale-[0.98] transition-all cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-medium px-4 py-2 border border-zinc-200 rounded-md hover:bg-zinc-50 active:scale-[0.98] transition-all cursor-pointer font-sans"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/" element={<Feed user={user} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
