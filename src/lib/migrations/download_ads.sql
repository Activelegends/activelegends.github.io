-- جدول تبلیغات صفحه‌های دانلود
-- این اسکریپت را در Supabase → SQL Editor اجرا کنید.

CREATE TABLE IF NOT EXISTS download_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position TEXT NOT NULL,           -- top | after_button | page_bottom
  title TEXT NOT NULL,              -- فقط برای مدیریت داخلی
  html_snippet TEXT NOT NULL,       -- کد کامل HTML/JS (مثلاً یکتانت یا تبلیغ کاستوم)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_ads_position_priority
  ON download_ads(position, priority);

ALTER TABLE download_ads ENABLE ROW LEVEL SECURITY;

-- خواندن برای همه (برای رندر کلاینت)
DROP POLICY IF EXISTS "download_ads_select_public" ON download_ads;
CREATE POLICY "download_ads_select_public"
ON download_ads FOR SELECT
TO anon, authenticated
USING (true);

-- نوشتن فقط برای کاربران لاگین‌شده (ادمین)
DROP POLICY IF EXISTS "download_ads_write_authenticated" ON download_ads;
CREATE POLICY "download_ads_write_authenticated"
ON download_ads FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

GRANT SELECT ON download_ads TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON download_ads TO authenticated;

