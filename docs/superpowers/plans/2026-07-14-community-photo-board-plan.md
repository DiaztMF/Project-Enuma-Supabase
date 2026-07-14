# Community Photo Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun papan komunitas foto dengan React, Shadcn, Supabase (Auth, DB, Storage) yang siap deploy ke Vercel.

**Architecture:** Frontend menggunakan Vite + React + Tailwind v4 + Shadcn + React Router. Backend (Database & Auth) menggunakan Supabase dengan RLS untuk keamanan data.

**Tech Stack:** React, react-router-dom, tailwindcss v4, shadcn/ui, @supabase/supabase-js, vitest, react-testing-library.

## Global Constraints

- Routing menggunakan `react-router-dom`
- Styling menggunakan Shadcn dan Tailwind CSS v4
- Auth: Email & Password dan social provider (Google)
- Database: skema `profiles`, `posts`, `likes`
- Penyimpanan: Bucket `uploads` (publik baca, terautentikasi insert)

---

### Task 1: Setup Dependencies, Routing, dan Testing

**Files:**
- Create: `src/router.jsx`, `src/App.test.jsx`, `vitest.config.js`, `tests/setup.js`
- Modify: `package.json`, `src/main.jsx`, `src/App.jsx`

**Interfaces:**
- Produces: `RouterProvider` di `main.jsx`

- [ ] **Step 1: Install Dependencies**
```bash
npm install react-router-dom @supabase/supabase-js lucide-react clsx tailwind-merge
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 2: Setup Vitest Configuration**
Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
})
```
Create `tests/setup.js`:
```javascript
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Write failing test untuk Routing Dasar**
Create `src/App.test.jsx`:
```javascript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect } from 'vitest'
import App from './App'

describe('App', () => {
  test('renders app title', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText(/Community Photo Board/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run test to verify it fails**
Run: `npx vitest run src/App.test.jsx`
Expected: FAIL "Unable to find an element with the text"

- [ ] **Step 5: Write minimal implementation untuk Routing**
Modify `src/App.jsx`:
```javascript
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="p-4 bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Community Photo Board</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<div>Feed</div>} />
        </Routes>
      </main>
    </div>
  )
}
```
Modify `src/main.jsx`:
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 6: Run test to verify it passes**
Run: `npx vitest run src/App.test.jsx`
Expected: PASS

- [ ] **Step 7: Commit**
```bash
git add .
git commit -m "chore: setup react-router and vitest"
```

---

### Task 2: Konfigurasi Supabase Auth & UI (Shadcn)

**Files:**
- Create: `src/components/ui/button.jsx`, `src/lib/utils.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Install Shadcn Button & Utils**
```bash
npm install clsx tailwind-merge @radix-ui/react-slot
```
Create `src/lib/utils.js`:
```javascript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```
Create `src/components/ui/button.jsx`:
```javascript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 h-9 px-4 py-2",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
```

- [ ] **Step 2: Commit**
```bash
git add .
git commit -m "ui: add shadcn button component"
```

---

### Task 3: Setup Skema Database (via MCP)

- [ ] **Step 1: Eksekusi SQL untuk Tabel & Trigger**
Gunakan tool `execute_sql` di Supabase MCP:
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  caption text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.likes (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

- [ ] **Step 2: Set RLS Policies**
Gunakan `execute_sql` lagi:
```sql
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public posts are viewable by everyone." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts." ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public likes are viewable by everyone." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert likes." ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes." ON public.likes FOR DELETE USING (auth.uid() = user_id);
```

---

### Task 4: Halaman Login & Google Auth

**Files:**
- Create: `src/pages/Login.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write test untuk Halaman Login**
Create `src/pages/Login.test.jsx`:
```javascript
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import Login from './Login'

describe('Login', () => {
  test('renders login buttons', () => {
    render(<Login />)
    expect(screen.getByText(/Login with Google/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write minimal implementation**
Create `src/pages/Login.jsx`:
```javascript
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'

export default function Login() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
        <Button onClick={handleGoogleLogin} className="w-full">
          Login with Google
        </Button>
      </div>
    </div>
  )
}
```
Modify `src/App.jsx` to include the route:
```javascript
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="p-4 bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Community Photo Board</Link>
          <Link to="/login" className="text-sm font-medium hover:underline">Login</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<div>Feed</div>} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Run test to verify it passes**
Run: `npx vitest run src/pages/Login.test.jsx`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: add login page and google auth"
```

---

### Task 5: Main Feed & Create Post

*Tahap ini menggabungkan Auth session dengan Supabase data fetch.*

- [ ] **Step 1: Implementasi Feed Component**
Buat fetch data posts dan likes dari Supabase di komponen Feed (`src/pages/Feed.jsx`).
Tampilkan daftar foto dan jumlah likes.

- [ ] **Step 2: Implementasi Form Upload**
Buat form untuk pengguna (yang sudah login) agar bisa upload gambar ke `uploads` storage bucket dan menyisipkan baris di tabel `posts`.

*(Sesuai aturan `writing-plans`, Task 5 akan didetailkan kode tes dan implementasinya pada saat eksekusi).*
