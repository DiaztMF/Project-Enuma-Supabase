# Specification: Instagram Web-Style UI Redesign (Dark Mode)

**Date:** 2026-07-14
**Topic:** Instagram Web-style UI Overhaul (Dark Mode)

---

## 1. Goal & Context
Mengubah antarmuka Community Photo Board menjadi clone bertema gelap (*Dark Mode*) yang terinspirasi oleh tata letak 3-kolom Instagram Web. Halaman upload foto akan menggunakan modal pop-up interaktif di tengah layar, dan feed foto akan ditata secara vertikal lengkap dengan stories bar di atas.

---

## 2. Design System

### 2.A Colors & Typography
*   **Font Family:** `Inter`, sans-serif (untuk seluruh teks, menu, dan UI).
*   **Background (Canvas):** `#000000` (Pure Black).
*   **Card & Sidebar Background:** `#09090B` (Deep Zinc 950).
*   **Borders:** `#262626` (Zinc 800).
*   **Text Principal:** `#F5F5F5` (Zinc 100).
*   **Text Muted:** `#A8A8A8` (Zinc 400).
*   **Instagram Blue (CTAs):** `#0095F6`.
*   **Heart Active (Likes):** `#FF3040`.
*   **Stories Ring Gradient:** `linear-gradient(to top right, #f9ce34, #ee2a7b, #6228d7)`.

### 2.B Core Layout Metrics
*   **Left Sidebar Width:** 244px (lebar default desktop).
*   **Main Feed Container:** 630px max-width, dipusatkan di tengah layar.
*   **Right Suggestions Sidebar:** 320px width, hanya muncul pada resolusi desktop (`lg` ke atas).
*   **Transitions:** `transition-all duration-200 ease-in-out`.
*   **Active Scale Effect:** `active:scale-[0.98]` pada interaksi klik.

---

## 3. Layout & Flow Specifications

### 3.A Left Sidebar Navigation (Fixed)
*   Posisi tetap (*fixed*) di kiri layar dari atas ke bawah.
*   Berisi logo teks bergaya serif ("Community Board") di bagian atas.
*   Daftar tombol menu (dengan ikon Lucide):
    *   **Home:** Mengarahkan ke feed utama.
    *   **Search / Cari:** Tombol fungsional (mock).
    *   **Explore / Jelajahi:** Tombol fungsional (mock).
    *   **Messages / Pesan:** Tombol fungsional (mock).
    *   **Notifications / Notifikasi:** Tombol fungsional (mock).
    *   **Create / Buat:** Membuka modal postingan baru (hanya jika sudah login).
    *   **Profile / Profil:** Mengarahkan ke profil pengguna (jika login).
    *   **Login / Logout:** Tombol dinamis di bagian paling bawah untuk masuk/keluar.

### 3.B Center Content (Feed & Stories)
1.  **Stories Bar:**
    *   Tampil di bagian paling atas feed.
    *   Berisi deretan lingkaran avatar pengguna dengan cincin warna gradien Instagram.
    *   Scrollable secara horizontal tanpa bar scroll bawaan browser yang mengganggu (*scrollbar-none*).
2.  **Feed Postings (Single Column):**
    *   Postingan ditumpuk secara vertikal (bukan grid 3-kolom).
    *   Setiap post card dibatasi oleh garis tepi Zinc-800 tipis di atas dan bawah.
    *   Setiap postingan berisi:
        *   **Header:** Avatar bulat, nama pembuat `@username` tebal, dan durasi relatif (misal: `40m` atau tanggal).
        *   **Gambar Post:** Foto besar rasio aspek alami.
        *   **Action Buttons:** Baris berisi ikon Heart (Like), MessageCircle (Comment - mock), Send (Share - mock), Bookmark (mock).
        *   **Likes Count:** Text "X Suka" / "X likes".
        *   **Caption:** `@username` tebal diikuti isi caption teks.
        *   **Tanggal:** Terformat dalam format lokal Indonesia (`id-ID`).

### 3.C Right Sidebar (Suggestions & Profile)
*   Hanya dirender pada desktop (`lg:block hidden`).
*   Berisi baris profil pengguna yang saat ini masuk (avatar bulat besar, `@username`, Nama lengkap, dan tombol aksen "Switch").
*   Daftar pengguna lain di bawahnya sebagai rekomendasi/saran untuk diikuti, lengkap dengan tombol "Follow" berwarna biru khas Instagram.

### 3.D Central Upload Modal (Create Post Modal)
*   Dicuat melalui klik menu **"+" (Create)** di sidebar kiri.
*   Tampil di tengah viewport (`fixed inset-0 flex items-center justify-center z-50`).
*   Menggunakan *backdrop-blur* gelap (`bg-black/60`).
*   Struktur Modal Ganda (Split-panel pada desktop):
    *   **Kiri:** Tempat memilih file foto dan pratinjau (*preview*) foto setelah dipilih.
    *   **Kanan:** Kolom untuk menginput *caption* teks, informasi profil pembuat, dan tombol primer "Bagikan" (`#0095F6`).
    *   Tombol "X" (Tutup) di sudut kanan atas layar untuk membatalkan.

---

## 4. Verification & Testing Strategy
*   Menyesuaikan pengujian unit (`App.test.jsx`, `Feed.test.jsx`, `Login.test.jsx`) untuk memverifikasi komponen navigasi sidebar kiri, keberadaan modal unggah, dan elemen post card.
*   Memastikan tombol "Create" hanya memicu modal ketika user sudah masuk.
