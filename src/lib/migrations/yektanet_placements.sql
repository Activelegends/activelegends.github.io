-- جدول تنظیمات جای‌گذاری یکتانت
-- این اسکریپت را در Supabase → SQL Editor اجرا کنید.

CREATE TABLE IF NOT EXISTS yektanet_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- مثلا: post_start_image, post_end_text, sidebar_text, fixed_bottom, full_page
  label TEXT NOT NULL,      -- عنوان خوانا برای ادمین
  page TEXT NOT NULL DEFAULT 'blog_post', -- صفحه هدف: فعلا فقط blog_post
  position TEXT NOT NULL,   -- post_start | post_middle | post_end | sidebar | fixed_bottom | full_page
  format TEXT NOT NULL,     -- image | text | html
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  html_code TEXT NOT NULL DEFAULT '',
  insert_after_paragraph INTEGER,   -- برای post_middle: بعد از چند پاراگراف اولین بار درج شود
  repeat_every_paragraph INTEGER,   -- برای post_middle: هر چند پاراگراف یک‌بار تکرار شود (در صورت نیاز)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yektanet_placements_page_position
  ON yektanet_placements(page, position);

ALTER TABLE yektanet_placements
  ENABLE ROW LEVEL SECURITY;

-- همه بتوانند تنظیمات را بخوانند (فقط خواندن برای رندر کلاینت)
DROP POLICY IF EXISTS "yektanet_select_public" ON yektanet_placements;
CREATE POLICY "yektanet_select_public"
ON yektanet_placements
FOR SELECT
TO anon, authenticated
USING (true);

-- فقط کاربران لاگین‌شده (و معمولا ادمین‌ها) بتوانند ویرایش کنند
DROP POLICY IF EXISTS "yektanet_write_authenticated" ON yektanet_placements;
CREATE POLICY "yektanet_write_authenticated"
ON yektanet_placements
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

GRANT SELECT ON yektanet_placements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON yektanet_placements TO authenticated;

