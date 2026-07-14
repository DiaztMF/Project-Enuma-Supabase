# Database Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat tabel komentar di Supabase dan mengintegrasikannya dengan aplikasi web (mengubah dari state lokal ke database permanen).

---

### Task 1: Create Comments Table in Database

**Files:**
- None (Direct Database Operations)

- [ ] **Step 1: Execute SQL DDL script to create comments table**
Jalankan query DDL berikut di Supabase untuk membuat tabel `public.comments`, RLS, dan Policies:
```sql
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read comments" ON public.comments;
CREATE POLICY "Allow public read comments" ON public.comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert comments" ON public.comments;
CREATE POLICY "Allow authenticated insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Seed initial comments**
Jalankan query DML berikut untuk mengisi komentar tiruan:
```sql
INSERT INTO public.comments (id, post_id, user_id, text, created_at)
VALUES
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c001', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b001', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003', 'Keren banget auroranya! 🌌', now() - interval '1 day'),
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c002', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b001', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a002', 'Komposisi warnanya luar biasa.', now() - interval '20 hours'),
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c003', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b002', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a004', 'Sangat menyukai eksperimen warna ini! 🎨', now() - interval '15 hours'),
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c004', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b003', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a005', 'Pemandangannya memukau sekali!', now() - interval '8 hours'),
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c005', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b004', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001', 'Tokyo malam memang magis 🗼', now() - interval '5 hours'),
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c006', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b004', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a004', 'Nice shot! Warnanya tajam.', now() - interval '4 hours')
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 3: Verify comments count**
Query: `SELECT count(*) FROM public.comments;`
Expected: 6.

---

### Task 2: Integrate Database Comments in Feed.jsx & Feed.test.jsx

**Files:**
- Modify: `src/pages/Feed.jsx`
- Modify: `src/pages/Feed.test.jsx`

- [ ] **Step 1: Update Mock in Feed.test.jsx**
Ubah mock `supabase` di `Feed.test.jsx` untuk menambahkan data komentar dalam kembalian data posts:
```javascript
comments: [
  { id: 'c-1', text: 'Komentar Mock 1', profiles: { username: 'testuser2' } }
]
```

- [ ] **Step 2: Update Feed.jsx to fetch and insert comments**
  1. Hapus state `comments` lokal yang berisi `INITIAL_MOCK_COMMENTS`.
  2. Modifikasi `.select(...)` query di `fetchPosts` agar memuat join ke `comments` dan `profiles(username)` pengirim komentar.
  3. Ubah `handleAddComment` agar melakukan insert data ke database:
     ```javascript
     const { error } = await supabase
       .from('comments')
       .insert({
         post_id: postId,
         user_id: user.id,
         text: text
       })
     ```
  4. Sesuaikan fungsi rendering komentar agar langsung membaca array `post.comments`.

- [ ] **Step 3: Run all unit tests and verify they pass**
Run: `npx vitest run`
Expected: PASS (14 passed).

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: complete database comments integration"
```
