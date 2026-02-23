-- رفع ارور: new row violates row-level security policy for table "blog_comments"
-- این فایل را در Supabase → SQL Editor اجرا کنید.

-- ۱) دادن دسترسی INSERT به نقش anon و authenticated
GRANT SELECT, INSERT ON blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comments TO authenticated;

-- ۲) پالیسی قبلی INSERT را حذف و با دو پالیسی جدا (anon + authenticated) جایگزین کن
DROP POLICY IF EXISTS "blog_comments_insert_public" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_insert_anon" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_insert_authenticated" ON blog_comments;

CREATE POLICY "blog_comments_insert_anon"
ON blog_comments FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "blog_comments_insert_authenticated"
ON blog_comments FOR INSERT TO authenticated
WITH CHECK (true);
