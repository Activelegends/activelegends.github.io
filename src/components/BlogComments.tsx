import { useEffect, useState } from 'react';
import { blogCommentService, type BlogComment } from '../services/blogCommentService';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useDefaultAvatarUrls } from '../hooks/useDefaultAvatarUrls';
import { pickDefaultAvatarUrl } from '../services/defaultAvatarsService';

interface BlogCommentsProps {
  postId: string;
}

function CommentItem({
  c,
  currentUserId,
  defaultAvatarUrls,
  onReply,
  onLike,
  onReplySubmit,
  isReply = false,
}: {
  c: BlogComment;
  currentUserId: string | null;
  defaultAvatarUrls: string[];
  onReply: (id: string) => void;
  onLike: (id: string) => void;
  onReplySubmit: (parentId: string, content: string) => void;
  isReply?: boolean;
}) {
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likeCount, setLikeCount] = useState(c.likes_count ?? 0);
  const [liked, setLiked] = useState(c.liked ?? false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleLike = async () => {
    if (!currentUserId || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await blogCommentService.toggleLike(c.id, currentUserId);
      setLiked(res.liked);
      setLikeCount(res.count);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      await onReplySubmit(c.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  const avatarUrl = c.author_image_url || pickDefaultAvatarUrl(c.author_email || c.id, defaultAvatarUrls);

  return (
    <li className={isReply ? 'mr-6 mt-3 border-r-2 border-white/10 pr-3' : ''}>
      <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex gap-3">
        <img
          src={avatarUrl}
          alt={c.author_name}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          onError={(e) => { e.currentTarget.src = pickDefaultAvatarUrl(c.id, defaultAvatarUrls) || '/AE logo.svg'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-white text-sm">{c.author_name}</span>
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: faIR })}
            </span>
          </div>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{c.content}</p>
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              disabled={!currentUserId || likeLoading}
              className={`flex items-center gap-1 text-xs ${liked ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              <FaThumbsUp className={liked ? 'fill-current' : ''} />
              <span>{likeCount}</span>
            </button>
            {!isReply && (
              <button
                type="button"
                onClick={() => { setShowReplyForm(!showReplyForm); onReply(c.id); }}
                className="text-gray-400 hover:text-primary text-xs flex items-center gap-1"
              >
                <FaReply /> پاسخ
              </button>
            )}
          </div>
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ شما..."
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn-primary text-xs px-3 py-1.5" disabled={submittingReply}>
                  ارسال پاسخ
                </button>
                <button type="button" onClick={() => setShowReplyForm(false)} className="text-gray-400 text-xs">
                  انصراف
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {c.replies && c.replies.length > 0 && (
        <ul className="mt-2 space-y-2">
          {c.replies.map((r) => (
            <CommentItem
              key={r.id}
              c={r}
              currentUserId={currentUserId}
              defaultAvatarUrls={defaultAvatarUrls}
              onReply={onReply}
              onLike={onLike}
              onReplySubmit={onReplySubmit}
              isReply
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BlogComments({ postId }: BlogCommentsProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const defaultAvatarUrls = useDefaultAvatarUrls();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const isLoggedIn = !!user;
  const displayName = profile?.display_name?.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const authorImageUrl = profile?.profile_image_url || user?.user_metadata?.avatar_url || null;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await blogCommentService.getForPost(postId, user?.id ?? null);
      setComments(list);
    } catch (err: any) {
      console.error('Error loading blog comments', err);
      setError(err.message || 'خطا در بارگذاری نظرات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = isLoggedIn ? displayName : authorName.trim();
    const email = isLoggedIn ? (user!.email ?? '') : authorEmail.trim();
    if (!name || !email || !content.trim()) {
      setError('نام، ایمیل و متن نظر را وارد کنید.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await blogCommentService.add(postId, {
        author_name: name,
        author_email: email,
        content: content.trim(),
        user_id: user?.id ?? null,
        author_image_url: authorImageUrl,
      });
      setContent('');
      setSent(true);
      load();
    } catch (err: any) {
      console.error('Error submitting comment', err);
      setError(err.message || 'خطا در ارسال نظر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string, text: string) => {
    const name = isLoggedIn ? displayName : authorName.trim();
    const email = isLoggedIn ? (user!.email ?? '') : authorEmail.trim();
    if (!name || !email) {
      setError('برای پاسخ دادن با حساب کاربری وارد شوید یا نام و ایمیل را در باکس بالا وارد کنید.');
      return;
    }
    await blogCommentService.add(postId, {
      author_name: name,
      author_email: email,
      content: text,
      user_id: user?.id ?? null,
      parent_id: parentId,
      author_image_url: authorImageUrl,
    });
    load();
  };

  const handleLike = async (_commentId: string) => {
    if (!user?.id) return;
    await load();
  };

  return (
    <section className="mt-10 pt-6 border-t border-white/10">
      <h2 className="text-lg font-bold text-white mb-4">نظرات</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        {!isLoggedIn && (
          <>
            <input
              type="text"
              placeholder="نام شما"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="ایمیل (نمایش داده نمی‌شود)"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
            />
          </>
        )}
        {isLoggedIn && (
          <p className="text-gray-400 text-sm">
            در حال ارسال نظر با نام <strong className="text-white">{displayName}</strong> (از پروفایل شما).
          </p>
        )}
        <textarea
          placeholder="نظر شما..."
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary text-sm px-4 py-2" disabled={submitting}>
          {submitting ? 'در حال ارسال...' : 'ارسال نظر'}
        </button>
        {sent && (
          <p className="text-primary text-sm">نظر شما با موفقیت ثبت شد و پس از تأیید نمایش داده می‌شود.</p>
        )}
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">در حال بارگذاری نظرات...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm">هنوز نظری ثبت نشده. اولین نفر باشید!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              c={c}
              currentUserId={user?.id ?? null}
              defaultAvatarUrls={defaultAvatarUrls}
              onReply={() => {}}
              onLike={handleLike}
              onReplySubmit={handleReplySubmit}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
