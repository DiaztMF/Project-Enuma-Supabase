# Dynamic Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan pengambilan data Story dinamis dari Supabase (deduplikasi postingan per pengguna) dan membuat modal Story Viewer interaktif di `Feed.jsx` dengan pengatur waktu progress bar 3 detik otomatis.

---

### Task 1: Dynamic Stories & Viewer Implementation in Feed.jsx

**Files:**
- Modify: `src/pages/Feed.jsx`
- Modify: `src/pages/Feed.test.jsx`

- [ ] **Step 1: Write failing test untuk Story Viewer**
Ubah `src/pages/Feed.test.jsx` untuk menambahkan pengujian klik avatar story dan kemunculan story viewer modal:
```javascript
// Tambahkan import/perubahan di Feed.test.jsx untuk memverifikasi fungsionalitas penampil story
describe('Dynamic Stories Bar', () => {
  test('renders fetched user stories and triggers story viewer on click', async () => {
    // Assert story avatar rendered dynamically, klik avatar, lalu assert kemunculan viewer overlay
  })
})
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/pages/Feed.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Implement dynamic stories fetching in Feed.jsx**
Di `src/pages/Feed.jsx`, olah data `posts` yang telah berhasil di-fetch untuk mengekstrak 1 postingan terbaru per user ID untuk dijadikan list `stories`:
```javascript
// Tambahkan logika di Feed.jsx
const [stories, setStories] = useState([])
// Di dalam fetchPosts, setelah setPosts(data), buat list stories:
const uniqueUsers = {}
const dynamicStories = []
data?.forEach(post => {
  if (!uniqueUsers[post.profiles?.username]) {
    uniqueUsers[post.profiles?.username] = true
    dynamicStories.push({
      id: post.id,
      username: post.profiles?.username || 'user',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${post.profiles?.username}`,
      post_image: post.image_url,
      caption: post.caption,
      created_at: post.created_at
    })
  }
})
setStories(dynamicStories)
```

- [ ] **Step 4: Add Story Viewer Overlay Modal & Timer**
Buat status baru untuk penampil story:
```javascript
const [activeStoryIndex, setActiveStoryIndex] = useState(null) // null = closed
const [progress, setProgress] = useState(0)
```
Tambahkan efek timer 3 detik yang berjalan otomatis saat story aktif terbuka:
```javascript
useEffect(() => {
  if (activeStoryIndex === null) return
  setProgress(0)
  
  const interval = setInterval(() => {
    setProgress(prev => {
      if (prev >= 100) {
        clearInterval(interval)
        // Auto-advance
        if (activeStoryIndex < stories.length - 1) {
          setActiveStoryIndex(activeStoryIndex + 1)
        } else {
          setActiveStoryIndex(null) // close at end
        }
        return 100
      }
      return prev + 10
    })
  }, 300) // 10% setiap 300ms = 100% dalam 3 detik

  return () => clearInterval(interval)
}, [activeStoryIndex, stories.length])
```
Gambarkan UI Modal penampil story hitam penuh di bagian bawah `Feed.jsx`:
- Tampilkan nama pengguna, tombol Close (X), tombol Next/Prev (Chevron).
- Progress bar di atas modal: `<div className="h-1 bg-white" style={{ width: `${progress}%` }}>`

- [ ] **Step 5: Run tests and verify they pass**
Run: `npx vitest run src/pages/Feed.test.jsx`
Expected: PASS.

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "feat: implement dynamic stories bar and automated story viewer modal"
```
