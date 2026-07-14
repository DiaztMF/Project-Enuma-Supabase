# Login Page Redesign Spec

## Goal
Mendesain ulang halaman Login (`src/pages/Login.jsx`) dengan pendekatan Split-Screen Modern. Menggabungkan galeri visual estetik asimetris (Bento Grid) di sisi kiri dengan formulir login Google minimalis yang bersih di sisi kanan untuk memberikan impresi pertama yang premium, elegan, dan profesional bagi pengguna platform.

## Design Details

### 1. Tata Letak Split-Screen (55/45)
- Kontainer setinggi layar penuh (`min-h-[100dvh] flex md:flex-row flex-col overflow-hidden bg-zinc-50`).
- **Sisi Kiri (Kolom Visual Gallery - 55% lebar)**:
  - Disembunyikan di layar seluler (`hidden md:flex`).
  - Latar belakang dasar `bg-zinc-950` dengan padding `p-8`.
  - Struktur Bento Grid asimetris yang berisi 4 foto kurasi (menggunakan URL gambar Unsplash resolusi tinggi yang estetik: landscape, minimalist interior, human connection, dll.).
  - Di sudut kiri bawah, terdapat tulisan branding display elegan *"Enuma Community Board"* dan takarir monokromatik kecil.
- **Sisi Kanan (Area Autentikasi - 45% lebar atau 100% lebar di mobile)**:
  - Latar belakang putih bersih `bg-white`.
  - Formulir login diposisikan tepat di tengah layar (`flex flex-col items-center justify-center p-8`).

### 2. Form Login & Tombol Google Premium
Di dalam area autentikasi tengah:
- **Monogram Logo**:
  - Lingkaran dengan border gradien linier oranye-rose-ungu tipis.
  - Teks inisial "E" tebal di tengah lingkaran.
- **Judul & Teks Sambutan**:
  - Judul: *"Welcome to Community"* dengan font display sedang tebal.
  - Deskripsi: *"Explore curated stories and share your perspective with the creator community."*
- **Google Sign-In Button**:
  - Tombol lebar penuh dengan border ultra-tipis (`border-zinc-200`) dan bayangan mikro.
  - Memuat logo ikon Google SVG resmi berwarna.
  - Teks tombol: *"Continue with Google"*.
  - Aksi hover: Latar belakang berubah halus menjadi abu-abu ultra-terang (`bg-zinc-50`).
  - Aksi active: Penyusutan skala taktil (`active:scale-[0.98]`).
- **Guest Mode Link**:
  - Tombol atau tautan di bawah tombol Google: *"Explore as guest"* yang mengarahkan pengguna ke beranda feed (`/`) tanpa harus login terlebih dahulu.

### 3. Mikro-interaksi & Efek Visual
- **Staggered Fade-in**: Elemen bento grid sebelah kiri memudar masuk secara progresif dari bawah ke atas.
- **Bento Hover Zoom**: Foto di dalam bento grid membesar perlahan (`scale-105 transition-transform duration-700 ease-out`) saat diarahkan kursor.
- **Slow Rotate Logo**: Lingkaran gradien monogram berputar lambat terus-menerus (`animate-[spin_10s_linear_infinite]`).
