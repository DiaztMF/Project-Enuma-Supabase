# Navigation Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat halaman dinamis untuk masing-masing menu navigasi sidebar Instagram: Cari (Search), Jelajahi (Explore), Pesan (Messages), Notifikasi (Notifications), dan Profil (Profile) yang terhubung langsung ke database Supabase.

**Architecture:** 
1. `Search.jsx`: Input pencarian yang mencari kecocokan *caption* postingan menggunakan query `.ilike('caption', ...)` dari Supabase.
2. `Explore.jsx`: Menampilkan grid foto dari seluruh postingan komunitas, diurutkan secara acak atau berdasarkan jumlah suka.
3. `Messages.jsx`: Menampilkan inbox dinamis yang memuat daftar pengguna terdaftar dari tabel `profiles` dan memicu ruang obrolan mock.
4. `Notifications.jsx`: Menampilkan riwayat interaksi "Likes" yang dilakukan pengguna lain pada postingan milik pengguna saat ini.
5. `Profile.jsx`: Menampilkan statistik pengguna (jumlah postingan, total suka) serta grid foto kiriman mereka sendiri.

**Tech Stack:** React, react-router-dom, Tailwind CSS, Supabase JS, Lucide Icons, Vitest.

---

### Task 1: Navigation Pages Scaffolding & Routing

**Files:**
- Create: `src/pages/Search.jsx`
- Create: `src/pages/Explore.jsx`
- Create: `src/pages/Messages.jsx`
- Create: `src/pages/Notifications.jsx`
- Create: `src/pages/Profile.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Create simple page components (Scaffold)**
Buat file `src/pages/Search.jsx`:
```javascript
export default function Search() {
  return <div className="w-full max-w-[600px] text-white"><h2>Cari</h2></div>
}
```
Buat file `src/pages/Explore.jsx`:
```javascript
export default function Explore() {
  return <div className="w-full max-w-[935px] text-white"><h2>Jelajahi</h2></div>
}
```
Buat file `src/pages/Messages.jsx`:
```javascript
export default function Messages() {
  return <div className="w-full max-w-[935px] text-white"><h2>Pesan</h2></div>
}
```
Buat file `src/pages/Notifications.jsx`:
```javascript
export default function Notifications() {
  return <div className="w-full max-w-[600px] text-white"><h2>Notifikasi</h2></div>
}
```
Buat file `src/pages/Profile.jsx`:
```javascript
export default function Profile() {
  return <div className="w-full max-w-[935px] text-white"><h2>Profil</h2></div>
}
```

- [ ] **Step 2: Update routing in App.jsx**
Ubah tombol sidebar di `src/App.jsx` menjadi `Link` yang terhubung ke rute masing-masing halaman baru:
```javascript
// Gantilah elemen button navigasi di App.jsx dengan Link berikut:
<Link to="/search" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-900 transition-colors">
  <Search className="w-6 h-6" />
  <span className="text-sm font-medium md:inline hidden">Cari</span>
</Link>

<Link to="/explore" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-900 transition-colors">
  <Compass className="w-6 h-6" />
  <span className="text-sm font-medium md:inline hidden">Jelajahi</span>
</Link>

<Link to="/messages" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-900 transition-colors">
  <MessageCircle className="w-6 h-6" />
  <span className="text-sm font-medium md:inline hidden">Pesan</span>
</Link>

<Link to="/notifications" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-900 transition-colors">
  <Heart className="w-6 h-6" />
  <span className="text-sm font-medium md:inline hidden">Notifikasi</span>
</Link>

{user && (
  <Link to={`/profile/${username}`} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-900 transition-colors">
    <User className="w-6 h-6" />
    <span className="text-sm font-medium md:inline hidden truncate">@{username}</span>
  </Link>
)}
```
Daftarkan Route baru di bagian `<Routes>`:
```javascript
<Routes>
  <Route path="/" element={<Feed user={user} />} />
  <Route path="/login" element={<Login />} />
  <Route path="/search" element={<Search />} />
  <Route path="/explore" element={<Explore />} />
  <Route path="/messages" element={<Messages user={user} />} />
  <Route path="/notifications" element={<Notifications user={user} />} />
  <Route path="/profile/:username" element={<Profile user={user} />} />
</Routes>
```

- [ ] **Step 3: Update App.test.jsx to assert new routes**
```javascript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'
import App from './App'

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb) => {
        cb('SIGNED_IN', { user: { id: '123', email: 'test@example.com' } })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }
}))

describe('App Routing', () => {
  test('renders navigation links pointing to routes', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Beranda/i)).toBeInTheDocument()
    expect(screen.getByText(/Jelajahi/i).closest('a')).toHaveAttribute('href', '/explore')
  })
})
```

- [ ] **Step 4: Run test to verify passes**
Run: `npx vitest run src/App.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: scaffold search, explore, messages, notifications, profile pages and configure routing"
```

---

### Task 2: Profile Page Implementation (Dynamic Data)

**Files:**
- Modify: `src/pages/Profile.jsx`
- Create: `src/pages/Profile.test.jsx`

- [ ] **Step 1: Write failing test untuk Profil**
```javascript
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Profile from './Profile'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }
}))

describe('Profile Page', () => {
  test('renders user profile details and grids', async () => {
    render(
      <MemoryRouter initialEntries={['/profile/testuser']}>
        <Routes>
          <Route path="/profile/:username" element={<Profile user={{ id: '123' }} />} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText(/Kiriman/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/pages/Profile.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Implement dynamic Profile.jsx**
Tampilkan nama kreator, jumlah kiriman foto mereka dari Supabase, dan grid galeri foto mereka:
```javascript
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Grid, Heart, MessageCircle } from 'lucide-react'

export default function Profile({ user }) {
  const { username } = useParams()
  const [profilePosts, setProfilePosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileUser, setProfileUser] = useState(null)

  useEffect(() => {
    fetchProfileData()
  }, [username])

  async function fetchProfileData() {
    try {
      setLoading(true)
      // Get profile info
      const { data: profs, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profError) throw profError
      setProfileUser(profs)

      if (profs) {
        // Get posts of this profile
        const { data: posts, error: postError } = await supabase
          .from('posts')
          .select(`
            id,
            image_url,
            caption,
            likes (user_id)
          `)
          .eq('user_id', profs.id)

        if (postError) throw postError
        setProfilePosts(posts || [])
      }
    } catch (e) {
      console.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 font-sans">Memuat profil...</div>
  }

  if (!profileUser) {
    return <div className="text-center py-20 text-zinc-500 font-sans">Profil tidak ditemukan.</div>
  }

  return (
    <div className="w-full max-w-[935px] space-y-12">
      {/* Profile Header */}
      <div className="flex md:flex-row flex-col items-center md:space-x-20 space-y-6 md:space-y-0 border-b border-ig-border pb-12">
        <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center font-serif font-bold text-4xl text-white">
          {username[0].toUpperCase()}
        </div>
        <div className="space-y-4 text-left">
          <h2 className="text-2xl font-light">@{username}</h2>
          <div className="flex space-x-8 text-sm">
            <span><strong className="text-white">{profilePosts.length}</strong> kiriman</span>
            <span><strong className="text-white">{profilePosts.reduce((acc, p) => acc + (p.likes ? p.likes.length : 0), 0)}</strong> suka diterima</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">Bio pengguna @{username}</p>
          </div>
        </div>
      </div>

      {/* Grid Tab */}
      <div className="space-y-4">
        <div className="flex justify-center border-t border-white/20 -mt-12 py-3 text-xs tracking-wider uppercase font-semibold text-white space-x-1.5 items-center">
          <Grid className="w-4 h-4" />
          <span>KIRIMAN</span>
        </div>

        {profilePosts.length === 0 ? (
          <div className="text-center py-20 text-ig-muted">Belum ada postingan foto.</div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-7">
            {profilePosts.map(post => (
              <div key={post.id} className="relative aspect-square bg-zinc-900 group overflow-hidden rounded-md cursor-pointer border border-ig-border">
                <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-semibold">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{post.likes ? post.likes.length : 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/pages/Profile.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: implement profile page with dynamic post counts and grids"
```

---

### Task 3: Search Page Implementation (Dynamic Search Query)

**Files:**
- Modify: `src/pages/Search.jsx`
- Create: `src/pages/Search.test.jsx`

- [ ] **Step 1: Write failing test untuk Search**
```javascript
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Search from './Search'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      }))
    }))
  }
}))

describe('Search Page', () => {
  test('renders search input', () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/Cari postingan/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/pages/Search.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Implement dynamic search page**
Lakukan pencarian dinamis ke table `posts` berdasarkan caption:
```javascript
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Search as SearchIcon, Heart } from 'lucide-react'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      setSearching(true)
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
        .ilike('caption', `%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResults(data || [])
    } catch (e) {
      console.error(e.message)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="w-full max-w-[600px] space-y-6">
      <h2 className="text-xl font-bold font-serif">Cari Postingan</h2>
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari postingan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1c1c1e] border border-ig-border rounded-lg py-2 px-10 text-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-500"
          />
          <SearchIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
        </div>
        <button type="submit" className="bg-ig-blue px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 cursor-pointer">
          Cari
        </button>
      </form>

      {searching ? (
        <div className="text-center py-10 text-zinc-500">Mencari...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">Tidak ada hasil ditemukan.</div>
      ) : (
        <div className="space-y-4">
          {results.map(post => (
            <div key={post.id} className="flex space-x-4 p-3 border border-ig-border rounded-lg bg-ig-card">
              <img src={post.image_url} alt={post.caption} className="w-16 h-16 rounded-md object-cover" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold">@{post.profiles?.username}</p>
                <p className="text-xs text-zinc-400 truncate">{post.caption}</p>
                <div className="flex items-center space-x-1 text-xs text-zinc-500 mt-1">
                  <Heart className="w-3.5 h-3.5 fill-ig-heart text-ig-heart" />
                  <span>{post.likes ? post.likes.length : 0} Suka</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/pages/Search.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: implement search page with caption queries"
```

---

### Task 4: Explore, Messages, & Notifications Page Implementation

**Files:**
- Modify: `src/pages/Explore.jsx`
- Modify: `src/pages/Messages.jsx`
- Modify: `src/pages/Notifications.jsx`
- Create: `src/pages/Explore.test.jsx`
- Create: `src/pages/Messages.test.jsx`
- Create: `src/pages/Notifications.test.jsx`

- [ ] **Step 1: Write tests untuk Explore, Messages, & Notifications**
Buat `src/pages/Explore.test.jsx`:
```javascript
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import Explore from './Explore'
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }
}))
describe('Explore Page', () => {
  test('renders explore heading', async () => {
    render(<Explore />)
    expect(await screen.findByText(/Jelajahi Komunitas/i)).toBeInTheDocument()
  })
})
```
Buat `src/pages/Messages.test.jsx`:
```javascript
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import Messages from './Messages'
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }
}))
describe('Messages Page', () => {
  test('renders messages box', async () => {
    render(<Messages user={{ id: '123' }} />)
    expect(await screen.findByText(/Obrolan/i)).toBeInTheDocument()
  })
})
```
Buat `src/pages/Notifications.test.jsx`:
```javascript
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import Notifications from './Notifications'
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }
}))
describe('Notifications Page', () => {
  test('renders notifications heading', async () => {
    render(<Notifications user={{ id: '123' }} />)
    expect(await screen.findByText(/Notifikasi Aktivitas/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run src/pages/Explore.test.jsx src/pages/Messages.test.jsx src/pages/Notifications.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Implement dynamic Explore.jsx**
Tampilkan grid visual postingan global:
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Heart, MessageCircle } from 'lucide-react'

export default function Explore() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          likes (user_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (e) {
      console.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[935px] space-y-6">
      <h2 className="text-xl font-bold font-serif text-left">Jelajahi Komunitas</h2>
      {loading ? (
        <div className="text-center py-20 text-zinc-500">Memuat galeri...</div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-7">
          {posts.map(post => (
            <div key={post.id} className="relative aspect-square bg-zinc-900 group overflow-hidden rounded-md cursor-pointer border border-ig-border">
              <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-semibold">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{post.likes ? post.likes.length : 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Implement dynamic Messages.jsx**
Muat daftar seluruh *profiles* yang terdaftar untuk mock obrolan:
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Send } from 'lucide-react'

export default function Messages({ user }) {
  const [profiles, setProfiles] = useState([])
  const [activeProfile, setActiveProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user])

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*')
    setProfiles(data?.filter(p => p.id !== user?.id) || [])
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setChats([...chats, { sender: 'me', text: message }])
    setMessage('')
  }

  return (
    <div className="w-full max-w-[935px] border border-ig-border rounded-lg h-[600px] flex bg-ig-card text-white overflow-hidden">
      {/* Inbox List */}
      <div className="w-[350px] border-r border-ig-border flex flex-col">
        <div className="p-4 border-b border-ig-border">
          <h2 className="text-base font-bold">Obrolan</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-ig-border/50">
          {profiles.map(p => (
            <div 
              key={p.id} 
              onClick={() => setActiveProfile(p)}
              className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-zinc-900 transition-colors ${activeProfile?.id === p.id ? 'bg-zinc-900' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm">
                {p.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold">@{p.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col justify-between bg-black">
        {activeProfile ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-ig-border flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">
                {activeProfile.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold">@{activeProfile.username}</span>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chats.map((c, i) => (
                <div key={i} className={`flex ${c.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-xs ${c.sender === 'me' ? 'bg-ig-blue text-white' : 'bg-zinc-800 text-zinc-200'}`}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={sendMessage} className="p-4 border-t border-ig-border flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 bg-[#1c1c1e] border border-ig-border rounded-full py-2 px-4 text-sm focus:outline-none focus:border-zinc-700"
              />
              <button type="submit" className="p-2 bg-ig-blue rounded-full hover:bg-blue-600 cursor-pointer">
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <MessageCircle className="w-16 h-16 mb-2" />
            <p className="text-sm">Pilih pengguna untuk mulai mengirim pesan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement Notifications.jsx**
Ambil riwayat orang lain menyukai postingan milik user saat ini:
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Heart } from 'lucide-react'

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  async function fetchNotifications() {
    try {
      setLoading(true)
      // 1. Get user posts IDs
      const { data: posts } = await supabase.from('posts').select('id, image_url').eq('user_id', user.id)
      
      if (posts && posts.length > 0) {
        const postIds = posts.map(p => p.id)
        
        // 2. Fetch likes on those posts
        const { data: likes, error } = await supabase
          .from('likes')
          .select(`
            post_id,
            user_id,
            profiles (username)
          `)
          .in('post_id', postIds)

        if (error) throw error
        
        // Match image url to likes
        const notificationsData = likes?.map(like => {
          const matchedPost = posts.find(p => p.id === like.post_id)
          return {
            ...like,
            post_image: matchedPost?.image_url
          }
        }).filter(like => like.user_id !== user.id) || [] // exclude self likes

        setNotifications(notificationsData)
      }
    } catch (e) {
      console.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[600px] space-y-6 text-left">
      <h2 className="text-xl font-bold font-serif">Notifikasi Aktivitas</h2>
      {loading ? (
        <div className="text-center py-10 text-zinc-500">Memuat notifikasi...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">Belum ada aktivitas baru.</div>
      ) : (
        <div className="divide-y divide-ig-border">
          {notifications.map((notif, index) => (
            <div key={index} className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">
                  {notif.profiles?.username[0].toUpperCase()}
                </div>
                <p className="text-sm text-zinc-200">
                  <span className="font-semibold">@{notif.profiles?.username}</span> menyukai postingan Anda.
                </p>
              </div>
              {notif.post_image && (
                <img src={notif.post_image} alt="Post liked" className="w-10 h-10 object-cover rounded-md border border-ig-border" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run tests and verify they pass**
Run: `npx vitest run`
Expected: PASS ALL 7 TESTS.

- [ ] **Step 7: Commit**
```bash
git add .
git commit -m "feat: implement explore, messages, and notification pages with dynamic database bindings"
```
