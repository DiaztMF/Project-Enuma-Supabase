# Dynamic Stories Design Spec

## Goal
Mengubah Stories Bar di halaman Feed agar tidak lagi memuat data *hardcode* melainkan memuat profil pengguna tiruan secara dinamis berdasarkan postingan terbaru mereka dari database Supabase, serta menambahkan fitur interaktif **Story Viewer Overlay** dengan durasi 3 detik otomatis.

## Design Details

### 1. Dynamic Data Fetching
- Kita akan mengambil seluruh data `posts` dari database Supabase, lalu melakukan deduplikasi di sisi klien (JavaScript) agar menyisakan postingan paling baru untuk masing-masing pengguna (`user_id`).
- Struktur data Story yang dihasilkan:
  ```javascript
  {
    id: "post_id",
    username: "username",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=username", // Menggunakan inisial yang dinamis dan indah
    post_image: "image_url",
    caption: "caption",
    created_at: "created_at"
  }
  ```

### 2. Story Viewer Modal Overlay
Saat avatar pengguna di Stories Bar diklik:
- Menampilkan modal overlay penuh dengan latar belakang hitam pekat (`bg-black/95`).
- Menampilkan foto story (gambar postingan terbaru), informasi profil pembuat, dan caption di bagian bawah.
- **Instagram progress bar**: Di bagian atas modal, terdapat garis indikator durasi putih yang berjalan otomatis dari 0% ke 100% selama 3 detik.
- Setelah 3 detik selesai:
  - Otomatis berlanjut ke Story pengguna berikutnya di dalam antrean.
  - Jika sudah berada di story terakhir, modal akan tertutup secara otomatis.
- Tombol navigasi Manual (Panah kiri/kanan) untuk berpindah antar story sebelum durasi habis.
- Tombol "Close" (tanda X) di kanan atas untuk segera keluar dari penampil story.
