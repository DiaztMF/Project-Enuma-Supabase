# Specification: Community Photo Board Redesign (Editorial Light Mode)

**Date:** 2026-07-14
**Topic:** UI/UX Redesign & User Flow Optimization

---

## 1. Goal & Context
Mengubah tampilan Community Photo Board menjadi antarmuka bergaya **Editorial Light Mode** yang terinspirasi oleh majalah digital/Pinterest. Fokus pada visual foto, menyingkirkan elemen kartu abu-abu yang tebal, memindahkan alur upload ke panel Slide-over (Drawer) terpisah, dan mengoptimalkan navigasi status Login/Logout.

---

## 2. Design System

### 2.A Colors & Typography
*   **Font Heading:** `Lora` (Google Font Serif untuk judul dan nama kreator)
*   **Font Body & UI:** `Inter` (Sans-serif untuk konten teks, navigasi, input, dan tombol)
*   **Background:** `#F9F8F6` (Warm off-white)
*   **Text Principal:** `#18181B` (Zinc 900)
*   **Text Muted:** `#71717A` (Zinc 500)
*   **Teal Accent (CTAs):** `#0F766E` (Forest Teal)
*   **Rose Accent (Likes):** `#BE123C` (Rose 700)

### 2.B Core Layout Metrics
*   **Header Height:** 64px
*   **Responsive Photo Grid:** 3-column grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`)
*   **Tactile Active State:** Scale `scale-[0.98]` on click/active.
*   **Transitions:** `transition-all duration-200 ease-in-out`

---

## 3. Key Features & Flow Optimization

### 3.A Optimized Navigation & Auth Header
*   Single line header with `Lora` typography brand logo.
*   Jika user **belum login**: Tampilkan tombol "Login" bergaya minimalis.
*   Jika user **sudah login**:
    *   Tampilkan teks `@username` user saat ini.
    *   Tampilkan tombol **"+ Post Foto"** (Forest Teal accent).
    *   Tampilkan tombol **"Logout"** (Zinc 500 / border outline).

### 3.B Slide-over Upload Drawer (Flow Efficiency)
*   Menggantikan form upload di bagian atas feed utama yang memakan ruang.
*   Muncul dari kanan layar (`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l border-zinc-200`) dengan transisi mulus saat tombol "+ Post Foto" diklik.
*   Berisi Form:
    *   Judul drawer "Unggah Foto Baru" (Lora).
    *   Area Input File Image (PNG/JPG).
    *   Input Textarea Caption (Inter).
    *   Tombol "Posting" (Teal Accent).
    *   Tombol "Batal" (Close).

### 3.C Photo Grid Feed
*   Susunan kartu foto tanpa garis tepi tebal.
*   Setiap item berisi:
    *   Gambar foto dengan asio rasio alami/bersih.
    *   Footer informasi di bawah foto:
        *   Username pembuat di sebelah kiri (`Lora` bold, e.g. `@johndoe`).
        *   Tombol Heart Like + Angka total like di sebelah kanan.
        *   Caption foto yang ditulis tipis di bawahnya (`Inter` regular).
        *   Tanggal pembuatan terformat (`id-ID`).

---

## 4. Verification & Testing Strategy
*   Menambahkan unit test di `App.test.jsx`, `Feed.test.jsx`, dan `Login.test.jsx` untuk memverifikasi komponen-komponen baru (Upload Drawer, tombol Logout, dan grid).
*   Memastikan tombol "+ Post Foto" hanya tampil ketika user terautentikasi.
*   Memverifikasi bahwa transisi drawer berfungsi dengan benar di DOM.
