# Database Comments Design Spec

## Goal
Membuat tabel baru `public.comments` di database Supabase dan memodifikasi frontend di `Feed.jsx` agar mengambil dan menyimpan komentar langsung dari/ke database Supabase secara real-time.

## Design Details

### 1. Database Schema (`public.comments`)
Kita akan membuat tabel `comments` dengan relasi kunci asing (foreign key) ke `posts` dan `profiles`.
```sql
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id)
);

-- RLS & Kebijakan Keamanan (Policies)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Semua orang dapat membaca komentar
CREATE POLICY "Allow public read comments" ON public.comments
  FOR SELECT USING (true);

-- Pengguna terautentikasi dapat membuat komentar atas nama mereka sendiri
CREATE POLICY "Allow authenticated insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. Seed Data SQL
Kita akan menyisipkan data komentar awal dengan ID UUID tetap agar database langsung terpopulasi secara rapi:
- Komentar 1-2 di postingan Aurora Sky (`luna_shadow`, `kai_creative`)
- Komentar 3 di postingan Abstract Art (`zen_captures`)
- Komentar 4 di postingan Mountain Stars (`wander_dream`)
- Komentar 5-6 di postingan Tokyo Neon (`aurora_sky`, `zen_captures`)

### 3. Frontend Integration (`src/pages/Feed.jsx`)
- **Fetch data**:
  Kita ubah query pencarian postingan (`fetchPosts`) agar turut memuat relasi tabel `comments`:
  ```javascript
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      caption,
      created_at,
      profiles!posts_user_id_fkey (username),
      likes (user_id),
      comments (
        id,
        text,
        profiles (username)
      )
    `)
    .order('created_at', { ascending: false })
  ```
- **Insert data**:
  Mengubah fungsi `handleAddComment` agar menyisipkan data ke database:
  ```javascript
  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      text: text
    })
  ```
