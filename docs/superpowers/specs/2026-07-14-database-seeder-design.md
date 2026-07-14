# Database Seeder Spec Design

## Goal
Mengimplementasikan seeder data dinamis langsung ke database Supabase untuk menyimulasikan pengguna lain, kiriman foto, dan interaksi suka (likes) sehingga seluruh halaman (Cari, Jelajahi, Pesan, Notifikasi, dan Profil) berjalan menggunakan data dinamis yang realistis.

## Proposed SQL Seed Schema

### 1. Mock Users (`auth.users`)
Kita akan menyisipkan 5 pengguna baru dengan email dan ID unik. Trigger `on_auth_user_created` otomatis akan menyisipkan data profil ke tabel `public.profiles`.
- **User 1**: `aurora_sky` (ID: `a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001`)
- **User 2**: `kai_creative` (ID: `a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a002`)
- **User 3**: `luna_shadow` (ID: `a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003`)
- **User 4**: `zen_captures` (ID: `a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a004`)
- **User 5**: `wander_dream` (ID: `a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a005`)

### 2. Mock Posts (`public.posts`)
Kita akan menambahkan 6 kiriman gambar dinamis dari Unsplash dengan caption dan hashtag relevan, masing-masing terhubung ke salah satu pengguna di atas:
- **Aurora Sky**: Foto pemandangan Aurora Borealis (`image_url` dari Unsplash)
- **Kai Creative**: Foto seni abstrak (`image_url` dari Unsplash)
- **Luna Shadow**: 2 Foto (Pemandangan bintang gunung & Tokyo neon retro)
- **Zen Captures**: Foto arsitektur perkotaan klasik
- **Wander Dream**: Foto tas punggung/petualangan travel

### 3. Mock Likes (`public.likes`)
Untuk menguji halaman Notifikasi secara dinamis, pengguna tiruan di atas akan menyukai postingan milik pengguna aktif (`diaztmuhammadfirmansyah`):
- Postingan **"STEMSA SOLO WELL"** disukai oleh: `aurora_sky`, `kai_creative`, dan `luna_shadow`.
- Postingan **"sampah"** disukai oleh: `zen_captures` dan `wander_dream`.

## Implementation Flow
1. Model mengeksekusi script SQL di atas ke database Supabase menggunakan MCP `execute_sql`.
2. Halaman web dikonfigurasi ulang (jika ada *hardcode* tersisa) agar murni memanggil data Supabase. (Sudah sepenuhnya dinamis, jadi tinggal memuat datanya saja).
