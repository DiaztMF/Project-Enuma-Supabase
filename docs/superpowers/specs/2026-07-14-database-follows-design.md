# Database Follows Design Spec

## Goal
Mengimplementasikan sistem hubungan pengikut (Follows) berbasis database permanen di Supabase. Fitur ini akan memfilter daftar saran di panel kanan agar hanya merekomendasikan pengguna yang belum diikuti, serta memperbarui tombol "Ikuti/Mengikuti" secara real-time langsung ke database.

## Design Details

### 1. Database Schema (`public.follows`)
Tabel baru `follows` mencatat relasi pengikut:
```sql
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id),
  CONSTRAINT follows_not_self CHECK (follower_id <> following_id)
);

-- RLS & Policies
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Semua orang dapat melihat siapa mengikuti siapa
CREATE POLICY "Allow public read follows" ON public.follows
  FOR SELECT USING (true);

-- Pengguna login dapat melakukan follow (insert) atas nama mereka sendiri
CREATE POLICY "Allow authenticated insert follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Pengguna login dapat melakukan unfollow (delete) atas nama mereka sendiri
CREATE POLICY "Allow authenticated delete follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);
```

### 2. Seed Data SQL
Kita akan menyisipkan beberapa hubungan follow awal agar sistem langsung terisi data realistis:
- Pengguna aktif (`diaztmuhammadfirmansyah` - ID: `d3e897d2-7cf7-40ca-b29d-eb0036adfb4a`) mengikuti `aurora_sky` (ID: `a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001`).
- Pengguna aktif mengikuti `luna_shadow` (ID: `a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003`).
- Ini menyisakan `kai_creative`, `zen_captures`, dan `wander_dream` sebagai pengguna yang belum diikuti (yang akan muncul di daftar saran!).

### 3. Frontend Integration (`src/pages/Feed.jsx`)
- **State Baru**:
  - `followingIds`: Array ID pengguna yang diikuti oleh pengguna aktif (`[]`).
  - `suggestions`: Array profil pengguna yang disarankan (`[]`).
- **Fetch Data**:
  - Mengambil daftar profil yang diikuti oleh pengguna aktif:
    ```javascript
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
    ```
  - Mengambil daftar profil lain dari `public.profiles`.
  - Memfilter daftar rekomendasi di frontend agar mengecualikan pengguna aktif itu sendiri serta pengguna yang sudah diikuti. Menampilkan maksimal 3-5 pengguna di panel kanan.
- **Toggle Follow Action**:
  - Jika belum diikuti: Insert ke tabel `follows`.
  - Jika sudah diikuti: Delete dari tabel `follows`.
  - Memicu pembaruan daftar saran secara dinamis.
