import { useEffect, useState } from 'react';
import { blogCommentService, type BlogComment } from '../services/blogCommentService';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface BlogCommentsProps {
  postId: string;
}

export default function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ author_name: '', author_email: '', content: '' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await blogCommentService.getForPost(postId);
        setComments(list);
      } catch (err: any) {
        console.error('Error loading blog comments', err);
        setError(err.message || 'خطا در بارگذاری نظرات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.author_email.trim() || !form.content.trim()) {
      setError('نام، ایمیل و متن نظر را وارد کنید.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await blogCommentService.add(postId, form);
      setForm({ author_name: '', author_email: '', content: '' });
      setSent(true);
      setError(null);
    } catch (err: any) {
      console.error('Error submitting comment', err);
      setError(err.message || 'خطا در ارسال نظر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 pt-6 border-t border-white/10">
      <h2 className="text-lg font-bold text-white mb-4">نظرات</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          type="text"
          placeholder="نام شما"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          value={form.author_name}
          onChange={(e) => setForm((p) => ({ ...p, author_name: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="ایمیل (نمایش داده نمی‌شود)"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          value={form.author_email}
          onChange={(e) => setForm((p) => ({ ...p, author_email: e.target.value }))}
          required
        />
        <textarea
          placeholder="نظر شما..."
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
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
            <li key={c.id} className="bg-black/30 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-white text-sm">{c.author_name}</span>
                <span className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: faIR })}
                </span>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
