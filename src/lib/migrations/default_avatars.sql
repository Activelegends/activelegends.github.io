-- لوگوهای پیش‌فرض برای کاربران بدون عکس — اجرا در Supabase SQL Editor

CREATE TABLE IF NOT EXISTS default_avatars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_default_avatars_sort ON default_avatars(sort_order);

ALTER TABLE default_avatars ENABLE ROW LEVEL SECURITY;

-- همه می‌توانند لیست لوگوها را ببینند (برای نمایش در سایت)
DROP POLICY IF EXISTS "default_avatars_select" ON default_avatars;
CREATE POLICY "default_avatars_select"
ON default_avatars FOR SELECT TO anon, authenticated
USING (true);

-- فقط لاگین‌شده (ادمین) برای مدیریت
DROP POLICY IF EXISTS "default_avatars_all_authenticated" ON default_avatars;
CREATE POLICY "default_avatars_insert_authenticated"
ON default_avatars FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "default_avatars_update_authenticated"
ON default_avatars FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "default_avatars_delete_authenticated"
ON default_avatars FOR DELETE TO authenticated USING (true);

GRANT SELECT ON default_avatars TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON default_avatars TO authenticated;
