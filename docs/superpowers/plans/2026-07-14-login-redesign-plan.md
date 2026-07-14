# Login Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mendesain ulang halaman Login (`src/pages/Login.jsx`) dengan tata letak Split-Screen (Bento Gallery & Premium Form) dan menyelaraskan file pengujiannya (`src/pages/Login.test.jsx`).

---

### Task 1: Redesign Login Component

**Files:**
- Modify: [Login.jsx](file:///d:/Project/Web%20Project/Enuma/Enuma%20Training/Supabase/src/pages/Login.jsx)

- [ ] **Step 1: Implement Split-Screen Layout Structure**
  Ubah wrapper utama di `Login.jsx` menjadi kontainer flex responsif:
  - Sisi Kiri (Bento Grid): `hidden md:flex md:w-[55%] h-[100dvh] bg-zinc-950 p-8 flex-col justify-between overflow-hidden relative`
  - Sisi Kanan (Form Card): `w-full md:w-[45%] h-[100dvh] bg-white flex flex-col items-center justify-center p-8 relative`

- [ ] **Step 2: Build Left Column Bento Grid Gallery**
  Rancang 4 panel gambar asimetris:
  - Kotak 1 (Utama): `col-span-2 row-span-2`
  - Kotak 2: `col-span-1 row-span-1`
  - Kotak 3: `col-span-1 row-span-2`
  - Kotak 4: `col-span-1 row-span-1`
  Gunakan URL gambar Unsplash estetik resolusi tinggi. Tambahkan kelas transition (`transition-transform duration-700 ease-out hover:scale-105`) pada setiap gambar.

- [ ] **Step 3: Build Right Column Login Form Card**
  - Buat monogram logo lingkaran dengan inisial "E" tebal dan gradient border yang berputar lambat (`animate-[spin_12s_linear_infinite] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600`).
  - Tambahkan display heading sambutan: *"Connect with visual minds"* dan deskripsi singkat.
  - Tambahkan tombol Google Sign-In premium dengan SVG ikon Google berwarna resmi dan efek tactile active (`active:scale-[0.98] transition-transform`).
  - Tambahkan tombol "Explore as guest" (Link React Router ke `/`).

---

### Task 2: Update Login Tests

**Files:**
- Modify: [Login.test.jsx](file:///d:/Project/Web%20Project/Enuma/Enuma%20Training/Supabase/src/pages/Login.test.jsx)

- [ ] **Step 1: Update Login.test.jsx**
  Sesuaikan assertions dalam pengujian agar memverifikasi:
  - Keberadaan judul sambutan *"Connect with visual minds"* atau *"Welcome to Community"*.
  - Keberadaan tombol *"Continue with Google"*.
  - Keberadaan tombol *"Explore as guest"*.

---

### Task 3: Verify & Compile

- [ ] **Step 1: Run all unit tests and verify they pass**
  Run: `npx vitest run`
  Expected: PASS (14 passed).

- [ ] **Step 2: Commit**
  Commit all changes on the `main` branch:
  ```bash
  git add .
  git commit -m "feat: redesign login page with premium split-screen layout"
  ```
