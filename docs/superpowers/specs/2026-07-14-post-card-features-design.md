# Post Card Features Design Spec

## Goal
Mengimplementasikan fungsionalitas interaktif penuh pada Card Postingan (Feed) agar tidak ada ikon/tombol statis. Penambahan meliputi sistem komentar lokal, ketuk dua kali untuk menyukai (double-click to like) dengan animasi visual, fitur salin tautan bagikan (share), serta toggle bookmark penyimpanan postingan secara lokal.

## Design Details

### 1. Sistem Komentar Lokal (Comments)
- **State**:
  - `comments`: Objek berisi daftar komentar per postingan (`{ [postId]: [{ username, text }] }`).
  - `commentInputs`: Menyimpan teks input komentar yang sedang diketik per postingan (`{ [postId]: '' }`).
- **Data Awal**:
  - Menyediakan komentar awal untuk postingan yang baru saja di-seed oleh para pengguna tiruan (e.g. `@luna_shadow`, `@kai_creative`) agar feed terasa ramai dan dinamis.
- **Interaksi**:
  - Menampilkan 2 komentar terakhir di bawah deskripsi postingan.
  - Terdapat tombol "Lihat semua komentar" jika jumlah komentar > 2, yang akan membuka list lengkap di card tersebut.
  - Form input komentar satu baris di bagian bawah card dengan tombol "Kirim" (aktif hanya ketika teks tidak kosong).

### 2. Double-Click to Like dengan Animasi Hati Pop-Up
- **Logika**:
  - Menambahkan event `onDoubleClick` pada area foto postingan.
  - Jika belum disukai, pemicu `toggleLike(postId, false)` akan dijalankan secara otomatis.
- **Animasi Visual**:
  - Saat di-double-click, state `animateHeartPostId` diset ke `postId` selama 800ms.
  - Di tengah foto, akan muncul ikon Hati Putih besar (`Heart` Lucide dengan `fill-white text-white w-20 h-20`) yang memudar dan membesar (efek pop-out/fade-out menggunakan animasi Tailwind `animate-ping` / scale-up).

### 3. Share / Send Post ke Clipboard
- **Interaksi**:
  - Klik pada ikon Kirim (Send) akan menyalin URL tiruan postingan (`window.location.origin + '/post/' + postId`) ke clipboard.
  - Menampilkan notifikasi Toast minimalis hitam melayang di bagian bawah layar ("Tautan disalin ke papan klip!") selama 2 detik.

### 4. Bookmark (Simpan Postingan)
- **State**:
  - `savedPostIds`: Array ID postingan yang disimpan (`[]`).
- **Interaksi**:
  - Klik ikon Bookmark (Save) akan memicu `toggleBookmark(postId)`.
  - Jika tersimpan, ikon akan berubah menjadi `Bookmark` terisi penuh (filled `fill-ig-text text-ig-text`).
