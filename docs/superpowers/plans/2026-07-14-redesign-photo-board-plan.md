# Redesign Photo Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah tampilan website menjadi Editorial Light Mode (Pinterest-style) dengan grid foto asimetris yang bersih, menambahkan Slide-over Drawer untuk memposting foto, serta merapikan status navigasi login/logout.

**Architecture:** Menggunakan Google Fonts Lora (Serif) dan Inter (Sans-serif) yang diimpor via `src/index.css`. Navigasi global diletakkan di `src/App.jsx` dengan sinkronisasi status login. Komponen Feed di `src/pages/Feed.jsx` akan merender Grid Foto dan Slide-over Drawer untuk pengunggahan.

**Tech Stack:** React, react-router-dom, Tailwind CSS v4, Lucide Icons, Vitest, React Testing Library.

## Global Constraints
- Tema: Editorial Light Mode (Background `#F9F8F6`, Text Zinc 900 `#18181B`, Aksen Teal `#0F766E`, Likes Rose 700 `#BE123C`).
- Font: Lora untuk Heading & Nama Kreator, Inter untuk Body & UI.
- Layout: Header tinggi 64px, Grid foto responsif 3-kolom, Upload Form dipindah ke Slide-over Drawer dari kanan layar.
- Perilaku: Transisi halus 200ms, feedback klik berupa transisi scale `scale-[0.98]`.

---

### Task 1: Style Foundation & Google Fonts Integration

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: CSS variabel `--font-serif`, `--font-sans`, `--bg-editorial` untuk layout global.

- [ ] **Step 1: Write index.css changes**
Tambahkan impor Google Fonts dan variabel tema di awal `src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&display=swap');

@theme {
  --font-serif: 'Lora', serif;
  --font-sans: 'Inter', sans-serif;
  --color-editorial-bg: #F9F8F6;
  --color-editorial-text: #18181B;
  --color-editorial-accent: #0F766E;
  --color-editorial-likes: #BE123C;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-editorial-bg);
  color: var(--color-editorial-text);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, .font-serif {
  font-family: var(--font-serif);
}
```

- [ ] **Step 2: Run build verification to ensure no errors**
Run: `npm run build` (atau verifikasi Vite server tidak komplain impor CSS).
Expected: Build sukses tanpa error kompilasi CSS.

- [ ] **Step 3: Commit**
```bash
git add src/index.css
git commit -m "style: integrate google fonts and define editorial theme tokens"
```

---

### Task 2: App Shell and Navigation Redesign

**Files:**
- Modify: `src/App.jsx`, `src/App.test.jsx`

**Interfaces:**
- Consumes: Supabase auth state di App level.
- Produces: Responsive Header (64px) dengan status Logout/User dan tombol trigger Drawer.

- [ ] **Step 1: Write failing test untuk Auth Header**
Perbarui `src/App.test.jsx` untuk memverifikasi tombol "Logout" muncul ketika user terautentikasi dan tombol "+ Post Foto" tersedia:
```javascript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'
import App from './App'

// Mock supabase auth
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb) => {
        cb('SIGNED_IN', { user: { id: '123', email: 'test@example.com' } })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
      signOut: vi.fn()
    }
  }
}))

describe('App Shell', () => {
  test('renders authenticated states in header', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Keluar/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/App.test.jsx`
Expected: FAIL karena tombol "Keluar" / Logout belum diimplementasikan di header `App.jsx`.

- [ ] **Step 3: Implement auth header minimal code**
Modify `src/App.jsx` untuk menangani status autentikasi Supabase dan menampilkan navigasi yang sesuai:
```javascript
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

    return () => subscription.unsubscribe()
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
                  @{user.email.split('@')[0]}
                </span>
                <Link 
                  to="/?create=true"
                  className="text-sm font-medium px-4 py-2 bg-editorial-accent text-white rounded-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
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
                className="text-sm font-medium px-4 py-2 border border-zinc-200 rounded-md hover:bg-zinc-50 active:scale-[0.98] transition-all cursor-pointer"
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
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/App.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: redesign app shell and handle user auth state in header"
```

---

### Task 3: Feed Component Redesign & Slide-over Drawer

**Files:**
- Modify: `src/pages/Feed.jsx`, `src/pages/Feed.test.jsx`

**Interfaces:**
- Consumes: `user` prop dari `App.jsx`.
- Produces: Grid foto 3-kolom yang indah dan Drawer panel untuk posting foto.

- [ ] **Step 1: Write failing test untuk Grid Foto & Drawer**
Perbarui `src/pages/Feed.test.jsx` untuk memverifikasi struktur feed dan keberadaan upload drawer saat query parameter `?create=true` aktif:
```javascript
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Feed from './Feed'

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }
}))

describe('Feed Page', () => {
  test('renders upload drawer when route matches query parameter', () => {
    render(
      <MemoryRouter initialEntries={['/?create=true']}>
        <Feed user={{ id: '123' }} />
      </MemoryRouter>
    )
    expect(screen.getByText(/Unggah Foto Baru/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/pages/Feed.test.jsx`
Expected: FAIL karena teks "Unggah Foto Baru" / drawer belum diimplementasikan.

- [ ] **Step 3: Implement Feed & Upload Drawer**
Ubah `src/pages/Feed.jsx` dengan UI grid minimalis dan slide-over drawer yang dikontrol query param:
```javascript
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'
import { Heart, UploadCloud, Loader2, X } from 'lucide-react'

export default function Feed({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Drawer visibility is controlled by ?create=true query param
  const isDrawerOpen = searchParams.get('create') === 'true' && !!user

  // Upload State
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          created_at,
          profiles!posts_user_id_fkey (username),
          likes (user_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !user) return

    try {
      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          caption: caption
        })

      if (dbError) throw dbError

      setFile(null)
      setCaption('')
      closeDrawer()
      fetchPosts()
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  async function toggleLike(postId, hasLiked) {
    if (!user) return alert("Silakan login untuk menyukai postingan.")

    try {
      if (hasLiked) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id })
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      }
      fetchPosts()
    } catch (error) {
      console.error(error.message)
    }
  }

  function closeDrawer() {
    navigate('/')
  }

  return (
    <div className="relative">
      {/* Upload Drawer (Slide-over) */}
      {isDrawerOpen && (
        <>
          {/* Overlay background */}
          <div 
            onClick={closeDrawer} 
            className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 transition-opacity"
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l border-zinc-200/80 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out">
            <div>
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold font-serif text-editorial-text">Unggah Foto Baru</h2>
                <button 
                  onClick={closeDrawer}
                  className="p-1 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">File Gambar</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-zinc-200 file:text-xs file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100 border p-2 rounded-md cursor-pointer"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Keterangan / Caption</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tulis cerita di balik foto ini..."
                    className="w-full border border-zinc-200 rounded-md p-3 text-sm focus:outline-none focus:border-editorial-accent/80 transition-colors"
                    rows="4"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={uploading || !file}
                  className="w-full bg-editorial-accent text-white py-2.5 rounded-md font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center cursor-pointer"
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunggah...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4 mr-2" /> Posting</>
                  )}
                </Button>
              </form>
            </div>

            <button 
              onClick={closeDrawer}
              className="w-full py-2 border border-zinc-200 text-zinc-500 rounded-md hover:bg-zinc-50 active:scale-[0.98] transition-all text-sm font-semibold cursor-pointer"
            >
              Batal
            </button>
          </div>
        </>
      )}

      {/* Main Feed Photos Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-400" />
          <p className="text-zinc-500 text-sm mt-3 font-serif">Memuat foto komunitas...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-zinc-200/50 rounded-xl max-w-xl mx-auto shadow-sm">
          <p className="text-zinc-500 font-serif">Belum ada karya foto yang dibagikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => {
            const hasLiked = user && post.likes?.some(like => like.user_id === user.id)
            const likeCount = post.likes ? post.likes.length : 0
            const username = post.profiles?.username || 'kreator'

            return (
              <div key={post.id} className="group flex flex-col space-y-3">
                {/* Photo container */}
                <div className="overflow-hidden rounded-lg bg-zinc-100 aspect-[4/5] border border-zinc-200/40 relative shadow-sm">
                  <img 
                    src={post.image_url} 
                    alt={post.caption || 'Foto Komunitas'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
                
                {/* Footer details */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-serif font-bold text-base text-editorial-text">
                      @{username}
                    </p>
                    <button 
                      onClick={() => toggleLike(post.id, hasLiked)}
                      className="flex items-center space-x-1.5 text-sm font-medium text-zinc-500 hover:text-editorial-text transition-colors cursor-pointer group/btn"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-transform group-active/btn:scale-90 ${hasLiked ? 'fill-editorial-likes text-editorial-likes' : 'text-zinc-400 hover:text-zinc-600'}`} 
                      />
                      <span>{likeCount}</span>
                    </button>
                  </div>
                  
                  {post.caption && (
                    <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                      {post.caption}
                    </p>
                  )}
                  
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold pt-1">
                    {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/pages/Feed.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/pages/Feed.jsx src/pages/Feed.test.jsx
git commit -m "feat: redesign feed layout to elegant 3-column photo grid and implement slide-over upload drawer"
```
