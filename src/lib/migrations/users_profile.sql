-- جدول پروفایل کاربران (اسم و آواتار مثل تلگرام) — اجرا در Supabase SQL Editor
-- اگر جدول users از قبل وجود دارد فقط ستون‌ها را اضافه کنید؛ وگرنه جدول را بسازید.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ستون‌ها در صورت وجود جدول قدیمی
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_public" ON users;
CREATE POLICY "users_select_public"
ON users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own"
ON users FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own"
ON users FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

GRANT SELECT ON users TO anon, authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;

-- باکت آواتار در Storage:
-- در Supabase → Storage → New bucket با نام "avatars" و Public: بله
-- Policies برای باکت avatars:
--   - SELECT (public read): برای همه
--   - INSERT: برای authenticated با CHECK (bucket_id = 'avatars')
--   - UPDATE: برای authenticated با USING (true)
--   - DELETE: برای authenticated با USING (true)
