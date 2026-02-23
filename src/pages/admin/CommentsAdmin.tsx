import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminQuickNav from '../../components/AdminQuickNav';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const ADMIN_EMAIL = 'active.legendss@gmail.com';

type CommentRow = {
  id: string;
  content: string;
  game_id: string;
  user_id: string;
  created_at: string;
  is_pinned: boolean;
  is_approved: boolean;
  user?: { email?: string | null } | null;
};

export default function CommentsAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          id,
          content,
          game_id,
          user_id,
          created_at,
          is_pinned,
          is_approved,
          user:user_id ( email )
        `
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setComments((data || []) as unknown as CommentRow[]);
    } catch (err: any) {
      console.error('Error loading comments', err);
      setError(err.message || 'خطا در دریافت نظرات');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return comments;
    const q = query.trim().toLowerCase();
    return comments.filter((c) => {
      const email = (c.user?.email || '').toLowerCase();
      return (
        c.content.toLowerCase().includes(q) ||
        c.game_id.toLowerCase().includes(q) ||
        email.includes(q)
      );
    });
  }, [comments, query]);

  const updateComment = async (id: string, patch: Partial<CommentRow>) => {
    try {
      setSavingId(id);
      setError(null);
      const { data, error } = await supabase
        .from('comments')
        .update(patch)
        .eq('id', id)
        .select(
          `
          id,
          content,
          game_id,
          user_id,
          created_at,
          is_pinned,
          is_approved,
          user:user_id ( email )
        `
        )
        .single();
      if (error) throw error;
      setComments((prev) => prev.map((c) => (c.id === id ? (data as any) : c)));
    } catch (err: any) {
      console.error('Error updating comment', err);
      setError(err.message || 'خطا در بروزرسانی نظر');
    } finally {
      setSavingId(null);
    }
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm('نظر حذف شود؟')) return;
    try {
      setSavingId(id);
      setError(null);
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting comment', err);
      setError(err.message || 'خطا در حذف نظر');
    } finally {
      setSavingId(null);
    }
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">
        دسترسی فقط برای ادمین مجاز است.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <AdminQuickNav />
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">مدیریت نظرات</h1>
          <button className="btn-secondary" onClick={load} disabled={loading}>
            بروزرسانی
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در متن/ایمیل/شناسه بازی..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500"
          />
        </div>

        {loading ? (
          <div className="text-gray-300">در حال بارگذاری...</div>
        ) : (
          <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-2xl">
            <table className="min-w-full text-xs md:text-sm text-gray-200">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-3 text-right">متن</th>
                  <th className="py-3 px-3 text-right">بازی</th>
                  <th className="py-3 px-3 text-right">ایمیل</th>
                  <th className="py-3 px-3 text-right">وضعیت</th>
                  <th className="py-3 px-3 text-right">اقدامات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 align-top">
                    <td className="py-3 px-3 max-w-[520px]">
                      <div className="line-clamp-3">{c.content}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(c.created_at).toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{c.game_id}</td>
                    <td className="py-3 px-3 text-gray-300">{c.user?.email || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[11px] ${c.is_approved ? 'text-green-400' : 'text-yellow-300'}`}>
                          {c.is_approved ? 'تایید شده' : 'در انتظار تایید'}
                        </span>
                        <span className={`text-[11px] ${c.is_pinned ? 'text-primary' : 'text-gray-400'}`}>
                          {c.is_pinned ? 'پین شده' : 'بدون پین'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-primary text-xs px-3 py-1"
                          disabled={savingId === c.id}
                          onClick={() => updateComment(c.id, { is_approved: !c.is_approved })}
                        >
                          {c.is_approved ? 'لغو تایید' : 'تایید'}
                        </button>
                        <button
                          className="btn-secondary text-xs px-3 py-1"
                          disabled={savingId === c.id}
                          onClick={() => updateComment(c.id, { is_pinned: !c.is_pinned })}
                        >
                          {c.is_pinned ? 'برداشتن پین' : 'پین'}
                        </button>
                        <button
                          className="text-xs px-3 py-1 rounded-xl border border-red-500/50 text-red-300 hover:bg-red-500/10"
                          disabled={savingId === c.id}
                          onClick={() => deleteComment(c.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      نظری یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

