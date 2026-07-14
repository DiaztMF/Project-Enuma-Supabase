# Database Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjalankan seeder database Supabase (menambahkan user baru, postingan foto Unsplash, dan relasi likes) untuk mengaktifkan notifikasi dan fitur feed dinamis.

---

### Task 1: Execute SQL Seeder in Database

**Files:**
- None (Direct Database Operations)

- [ ] **Step 1: Execute the SQL Seeder script**
Jalankan query SQL berikut di project Supabase `vkzevagprofcwsaorfon`:
```sql
-- 1. Insert into auth.users (with pgcrypto for password hashing)
INSERT INTO auth.users (id, email, role, aud, encrypted_password, email_confirmed_at, is_sso_user, is_anonymous, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001', 'aurora_sky@community.com', 'authenticated', 'authenticated', crypt('password123', gen_salt('bf')), now(), false, false, '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a002', 'kai_creative@community.com', 'authenticated', 'authenticated', crypt('password123', gen_salt('bf')), now(), false, false, '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003', 'luna_shadow@community.com', 'authenticated', 'authenticated', crypt('password123', gen_salt('bf')), now(), false, false, '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a004', 'zen_captures@community.com', 'authenticated', 'authenticated', crypt('password123', gen_salt('bf')), now(), false, false, '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a005', 'wander_dream@community.com', 'authenticated', 'authenticated', crypt('password123', gen_salt('bf')), now(), false, false, '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert into public.posts
INSERT INTO public.posts (id, user_id, image_url, caption, created_at)
VALUES
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b001', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=800&fit=crop', 'Keindahan langit aurora di malam hari yang sunyi #nature #sky', now() - interval '2 days'),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b002', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a002', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop', 'Eksperimen warna abstrak hari ini di studio seni ku 🎨🖌️', now() - interval '1 day'),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b003', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop', 'Menatap bintang di pegunungan yang bersalju dingin', now() - interval '12 hours'),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b004', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=800&fit=crop', 'Suasana neon retro malam ini di Tokyo 🗼🌆', now() - interval '6 hours'),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b005', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a004', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=800&fit=crop', 'Menangkap detail arsitektur kuno dengan lensa prima 📷✨', now() - interval '4 hours'),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b006', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a005', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=800&fit=crop', 'Petualangan baru dimulai dari kota kecil ini 🌍🎒', now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert likes for the current user's posts to trigger notifications
-- Post: '034a3054-bea1-4f2b-b3e4-1a86f35c8584'
INSERT INTO public.likes (post_id, user_id)
VALUES
  ('034a3054-bea1-4f2b-b3e4-1a86f35c8584', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a001'),
  ('034a3054-bea1-4f2b-b3e4-1a86f35c8584', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a002'),
  ('034a3054-bea1-4f2b-b3e4-1a86f35c8584', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a003')
ON CONFLICT (post_id, user_id) DO NOTHING;

-- Post: 'ec9d0b22-5609-46e6-869c-8697047ce57c'
INSERT INTO public.likes (post_id, user_id)
VALUES
  ('ec9d0b22-5609-46e6-869c-8697047ce57c', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a004'),
  ('ec9d0b22-5609-46e6-869c-8697047ce57c', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a005')
ON CONFLICT (post_id, user_id) DO NOTHING;
```

- [ ] **Step 2: Verify users insertion**
Query: `SELECT count(*) FROM public.profiles;`
Expected: > 5 profiles.

- [ ] **Step 3: Verify posts & likes insertion**
Query: `SELECT count(*) FROM public.posts;`
Query: `SELECT count(*) FROM public.likes;`
Expected: posts count > 6, likes count >= 5.

- [ ] **Step 4: Commit plan file**
```bash
git add .
git commit -m "feat: complete plan and run database seeding"
```
