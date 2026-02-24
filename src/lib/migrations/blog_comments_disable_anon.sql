-- غیرفعال‌کردن ارسال نظر برای مهمان (فقط کاربران لاگین‌شده بتوانند INSERT انجام دهند)
-- این اسکریپت را در Supabase → SQL Editor اجرا کنید.

-- ۱) لغو دسترسی INSERT برای نقش anon روی جدول نظرات
REVOKE INSERT ON blog_comments FROM anon;

-- ۲) حذف هر پالیسی INSERT قدیمی که به anon اجازه INSERT می‌دهد
DROP POLICY IF EXISTS "blog_comments_insert_anon" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_allow_insert" ON blog_comments;

-- ۳) ایجاد پالیسی INSERT فقط برای authenticated (اگر از قبل نیست)
DROP POLICY IF EXISTS "blog_comments_insert_authenticated" ON blog_comments;
CREATE POLICY "blog_comments_insert_authenticated"
ON blog_comments FOR INSERT
TO authenticated
WITH CHECK (true);

