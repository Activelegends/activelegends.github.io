-- فقط در صورت نبود جدول لایک، آن را بساز (بدون تغییر blog_comments)
-- اگر قبلاً blog_comments_like_reply.sql را اجرا کرده‌اید، این فایل اختیاری است.

-- جدول لایک نظرات بلاگ
CREATE TABLE IF NOT EXISTS blog_comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_comment_likes_comment ON blog_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comment_likes_user ON blog_comment_likes(user_id);

ALTER TABLE blog_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_comment_likes_select" ON blog_comment_likes;
CREATE POLICY "blog_comment_likes_select"
ON blog_comment_likes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blog_comment_likes_insert" ON blog_comment_likes;
CREATE POLICY "blog_comment_likes_insert"
ON blog_comment_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "blog_comment_likes_delete" ON blog_comment_likes;
CREATE POLICY "blog_comment_likes_delete"
ON blog_comment_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON blog_comment_likes TO authenticated;
GRANT SELECT ON blog_comment_likes TO anon;
