# Database Follows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat tabel follows di Supabase dan mengintegrasikannya dengan panel kanan (suggestions) di `Feed.jsx` agar dinamis dan persisten.

---

### Task 1: Create Follows Table in Database

**Files:**
- None (Direct Database Operations)

- [ ] **Step 1: Execute SQL DDL script to create follows table**
Jalankan query DDL berikut di Supabase untuk membuat tabel `public.follows`, RLS, dan Policies:
```sql
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id),
  CONSTRAINT follows_not_self CHECK (follower_id <> following_id)
);

-- RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read follows" ON public.follows;
CREATE POLICY "Allow public read follows" ON public.follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert follows" ON public.follows;
CREATE POLICY "Allow authenticated insert follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Allow authenticated delete follows" ON public.follows;
CREATE POLICY "Allow authenticated delete follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);
```

- [ ] **Step 2: Seed initial follows**
Jalankan query DML berikut untuk mengisi follows tiruan awal:
```sql
INSERT INTO public.follows (id, follower_id, following_id)
VALUES
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d001', 'd3e897d2-7cf7-40ca-b29d-eb0036adfb4a', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001'),
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d002', 'd3e897d2-7cf7-40ca-b29d-eb0036adfb4a', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003')
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 3: Verify follows count**
Query: `SELECT count(*) FROM public.follows;`
Expected: 2.

---

### Task 2: Integrate Database Follows in Feed.jsx & Feed.test.jsx

**Files:**
- Modify: [Feed.jsx](file:///d:/Project/Web%20Project/Enuma/Enuma%20Training/Supabase/src/pages/Feed.jsx)
- Modify: [Feed.test.jsx](file:///d:/Project/Web%20Project/Enuma/Enuma%20Training/Supabase/src/pages/Feed.test.jsx)

- [ ] **Step 1: Update Mock in Feed.test.jsx**
Ubah mock `supabase` di `Feed.test.jsx` untuk menambahkan data `follows` dan `profiles` mock:
```javascript
// Mock select follows dan select profiles
```

- [ ] **Step 2: Update Feed.jsx to fetch dynamic suggestions**
  1. Buat state `followingIds` dan `suggestions`.
  2. Implementasikan fungsi `fetchSuggestions` dan `fetchFollowing` untuk query Supabase.
  3. Hubungkan tombol "Ikuti/Mengikuti" di suggestions list agar melakukan insert/delete ke tabel `follows`.
  4. Saring data suggestions agar mengecualikan pengguna sendiri dan pengguna yang sudah diikuti.

- [ ] **Step 3: Run all unit tests and verify they pass**
Run: `npx vitest run`
Expected: PASS (14 passed).

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: complete database follows integration"
```
