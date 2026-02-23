-- رفع ارور: new row violates row-level security policy for table "blog_comments"
-- این فایل را در Supabase → SQL Editor اجرا کنید.

-- ۱) اطمینان از دسترسی schema و جدول
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comments TO authenticated;

-- ۲) حذف همه پالیسی‌های INSERT قبلی
DROP POLICY IF EXISTS "blog_comments_insert_public" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_insert_anon" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_insert_authenticated" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_allow_insert" ON blog_comments;

-- ۳) یک پالیسی واحد برای INSERT (هم مهمان هم لاگین‌شده)
CREATE POLICY "blog_comments_allow_insert"
ON blog_comments FOR INSERT
TO anon, authenticated
WITH CHECK (true);
