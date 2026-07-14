# Design Spec: Community Photo Board (Supabase + React)

## 1. Overview
Sebuah aplikasi web bergaya mini sosial media (papan komunitas) di mana pengguna dapat membagikan foto beserta caption, serta memberikan "Like" pada postingan orang lain. Aplikasi ini berfungsi sebagai demonstrasi integrasi 3 fitur utama Supabase: Auth, Database, dan Storage.

## 2. Core Features (MVP)
- **Public Feed**: Halaman utama yang menampilkan daftar semua foto yang diposting oleh komunitas, diurutkan dari yang terbaru.
- **Authentication**: Registrasi dan Login menggunakan Email & Password dan social provider (google)
- **Create Post**: Form untuk pengguna yang sudah login agar dapat mengunggah gambar (ke Supabase Storage) beserta teks caption (ke Supabase Database).
- **Like System**: Pengguna yang sudah login dapat menyukai (like) atau batal menyukai (unlike) postingan.
- **Deployment**: Deployment otomatis ke Vercel.

## 3. Architecture & Data Flow

### 3.1. Frontend
- **Framework**: React (Vite)
- **Styling**: Shadcn dan Tailwind CSS v4
- **Icons**: Lucide React
- **Routing**: react-router-dom

### 3.2. Database Schema (Supabase PostgreSQL)
- **`profiles`**:
  - `id` (uuid, FK ke auth.users)
  - `username` (text)
  - `created_at` (timestamp)
- **`posts`**:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK ke profiles.id)
  - `image_url` (text, referensi ke file di Storage)
  - `caption` (text)
  - `created_at` (timestamp)
- **`likes`**:
  - `post_id` (uuid, FK ke posts.id)
  - `user_id` (uuid, FK ke profiles.id)
  - *Primary Key*: Komposit (`post_id`, `user_id`)

### 3.3. Storage (Supabase Storage)
- **Bucket `uploads`**: Digunakan untuk menyimpan foto postingan pengguna.
- **Security (RLS)**: Hanya pengguna terautentikasi (Auth) yang diizinkan untuk mengunggah (`INSERT`) ke bucket ini. Semua orang (Public) diizinkan membaca (`SELECT`).

### 3.4. Database Triggers & RLS
- **Trigger**: Membuat fungsi SQL yang otomatis menyisipkan *row* baru ke tabel `profiles` setiap kali ada pendaftaran pengguna baru di Supabase Auth (`auth.users`).
- **RLS pada Tabel `posts`**: 
  - `SELECT`: Publik (Semua orang bisa melihat postingan).
  - `INSERT`: Hanya untuk pengguna terautentikasi (harus login).

## 4. UI/UX Flow
1. **Header**: Menampilkan judul aplikasi dan tombol "Login" atau "Profil Saya".
2. **Main Feed**: Menampilkan *grid* atau susunan vertikal seperti Instagram/Pinterest. Setiap *card* menampilkan: nama pengguna (pembuat), gambar, *caption*, dan tombol "Like" beserta jumlah total *like*.
3. **Upload Modal/Section**: Jika pengguna sudah login, akan muncul form/tombol untuk "Buat Postingan Baru".

## 5. Deployment
- Konfigurasi project untuk di-deploy ke Vercel melalui Git integration.
- Environment variables (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`) harus dimasukkan secara aman di dashboard pengaturan Vercel.
