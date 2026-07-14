# Post Card Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan fitur interaktif lengkap di Card Postingan `Feed.jsx` (Komentar lokal, Double-click to Like dengan animasi, Share to Clipboard + Toast, dan Bookmark Toggle).

---

### Task 1: Add Interactive Features to Post Card in Feed.jsx

**Files:**
- Modify: `src/pages/Feed.jsx`
- Modify: `src/pages/Feed.test.jsx`

- [ ] **Step 1: Write failing tests untuk Post Card Features**
Ubah `src/pages/Feed.test.jsx` untuk menambahkan pengujian:
  1. Komentar lokal (ketik komentar baru dan kirim, cek apakah dirender di bawah post).
  2. Double click to like (double click pada gambar post memicu toggleLike).
  3. Share post (klik ikon share menyalin tautan ke clipboard).
  4. Bookmark toggle (klik ikon bookmark mengubah ikon dari unfilled ke filled).

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/pages/Feed.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Implement Comments State & Input UI**
Di `src/pages/Feed.jsx`, tambahkan state komentar lokal dan input:
```javascript
const [comments, setComments] = useState({
  'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b001': [
    { id: 1, username: 'luna_shadow', text: 'Keren banget auroranya! 🌌' },
    { id: 2, username: 'kai_creative', text: 'Komposisi warnanya juara!' }
  ],
  'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b002': [
    { id: 1, username: 'zen_captures', text: 'Sangat menginspirasi karyanya 🎨' }
  ],
  'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b003': [
    { id: 1, username: 'wander_dream', text: 'Dingin tapi cantik pemandangannya!' }
  ]
})
const [commentInputs, setCommentInputs] = useState({})
```
Tambahkan form input komentar satu baris di bawah setiap postingan, tampilkan 2 komentar teratas, dan sediakan tombol "Lihat semua komentar".

- [ ] **Step 4: Implement Double-Click to Like + Pop Heart Animation**
Tambahkan event `onDoubleClick` pada container image postingan:
```javascript
const [animateHeartPostId, setAnimateHeartPostId] = useState(null)
```
Buat elemen Hati Putih besar dengan efek scale-up memudar di tengah gambar saat `animateHeartPostId === post.id`.

- [ ] **Step 5: Implement Share / Send to Clipboard + Toast**
Tambahkan handler salin tautan:
```javascript
const [shareToastText, setShareToastText] = useState('')
```
Salin tautan ke clipboard menggunakan `navigator.clipboard.writeText` dan tampilkan Toast hitam melayang selama 2 detik di bagian bawah layar.

- [ ] **Step 6: Implement Bookmark Toggle State**
Tambahkan state list postingan tersimpan:
```javascript
const [savedPostIds, setSavedPostIds] = useState([])
```
Buat ikon Bookmark berubah terisi (`fill-ig-text text-ig-text`) saat ID postingan berada dalam array `savedPostIds`.

- [ ] **Step 7: Run tests and verify they pass**
Run: `npx vitest run`
Expected: PASS (9 passed).

- [ ] **Step 8: Commit**
```bash
git add .
git commit -m "feat: implement interactive features on post card feed"
```
