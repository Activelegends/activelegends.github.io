-- جدول نظرات بلاگ — اجرا در Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created ON blog_comments(created_at DESC);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- دسترسی لازم برای نقش‌های anon و authenticated (الزامی برای رفع ارور RLS)
GRANT SELECT, INSERT ON blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comments TO authenticated;

-- همه می‌توانند نظرات تأییدشده را ببینند
DROP POLICY IF EXISTS "blog_comments_select_approved" ON blog_comments;
CREATE POLICY "blog_comments_select_approved"
ON blog_comments FOR SELECT TO anon, authenticated
USING (is_approved = true);

-- مهمان (بدون لاگین) می‌تواند نظر بگذارد
DROP POLICY IF EXISTS "blog_comments_insert_anon" ON blog_comments;
CREATE POLICY "blog_comments_insert_anon"
ON blog_comments FOR INSERT TO anon
WITH CHECK (true);

-- کاربر لاگین‌شده هم می‌تواند نظر بگذارد
DROP POLICY IF EXISTS "blog_comments_insert_authenticated" ON blog_comments;
CREATE POLICY "blog_comments_insert_authenticated"
ON blog_comments FOR INSERT TO authenticated
WITH CHECK (true);

-- فقط لاگین‌شده (ادمین) برای ویرایش/حذف
DROP POLICY IF EXISTS "blog_comments_update_authenticated" ON blog_comments;
CREATE POLICY "blog_comments_update_authenticated"
ON blog_comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "blog_comments_delete_authenticated" ON blog_comments;
CREATE POLICY "blog_comments_delete_authenticated"
ON blog_comments FOR DELETE TO authenticated USING (true);

-- ادمین باید همه نظرات را ببیند (از جمله تأییدنشده) — با یک پالیسی جدا یا از service role
DROP POLICY IF EXISTS "blog_comments_select_authenticated_all" ON blog_comments;
CREATE POLICY "blog_comments_select_authenticated_all"
ON blog_comments FOR SELECT TO authenticated
USING (true);
