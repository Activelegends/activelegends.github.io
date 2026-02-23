-- اجرا در Supabase: SQL Editor
-- با این پالیسی‌ها کاربران بدون لاگین هم می‌توانند بلاگ و تبلیغات را ببینند.

-- ========== blog_posts ==========
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- خواندن برای همه (مهمان و لاگین‌شده)
DROP POLICY IF EXISTS "blog_posts_select_public" ON blog_posts;
CREATE POLICY "blog_posts_select_public"
ON blog_posts FOR SELECT
TO anon, authenticated
USING (true);

-- نوشتن فقط برای لاگین‌شده (ادمین از داشبورد استفاده می‌کند)
DROP POLICY IF EXISTS "blog_posts_insert_authenticated" ON blog_posts;
CREATE POLICY "blog_posts_insert_authenticated"
ON blog_posts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "blog_posts_update_authenticated" ON blog_posts;
CREATE POLICY "blog_posts_update_authenticated"
ON blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "blog_posts_delete_authenticated" ON blog_posts;
CREATE POLICY "blog_posts_delete_authenticated"
ON blog_posts FOR DELETE TO authenticated USING (true);


-- ========== blog_ads ==========
ALTER TABLE blog_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_ads_select_public" ON blog_ads;
CREATE POLICY "blog_ads_select_public"
ON blog_ads FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "blog_ads_insert_authenticated" ON blog_ads;
CREATE POLICY "blog_ads_insert_authenticated"
ON blog_ads FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "blog_ads_update_authenticated" ON blog_ads;
CREATE POLICY "blog_ads_update_authenticated"
ON blog_ads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "blog_ads_delete_authenticated" ON blog_ads;
CREATE POLICY "blog_ads_delete_authenticated"
ON blog_ads FOR DELETE TO authenticated USING (true);
