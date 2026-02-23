import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminQuickNav from '../../components/AdminQuickNav';
import { blogCommentService, type BlogComment } from '../../services/blogCommentService';

const ADMIN_EMAIL = 'active.legendss@gmail.com';

export default function BlogCommentsAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }
    load();
  }, [user, navigate]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await blogCommentService.getAllForAdmin();
      setComments(list);
    } catch (err: any) {
      console.error('Error loading blog comments', err);
      setError(err.message || 'خطا در بارگذاری نظرات بلاگ');
    } finally {
      setLoading(false);
    }
  };

  const setApproved = async (id: string, is_approved: boolean) => {
    try {
      setSavingId(id);
      setError(null);
      await blogCommentService.updateApproved(id, is_approved);
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, is_approved } : c)));
    } catch (err: any) {
      setError(err.message || 'خطا در بروزرسانی');
    } finally {
      setSavingId(null);
    }
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm('این نظر حذف شود؟')) return;
    try {
      setSavingId(id);
      setError(null);
      await blogCommentService.delete(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'خطا در حذف');
    } finally {
      setSavingId(null);
    }
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        دسترسی فقط برای ادمین.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pt-24 pb-16">
      <AdminQuickNav />
      <div className="bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-4">نظرات بلاگ</h1>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-gray-300">در حال بارگذاری...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-200">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 text-right">نویسنده</th>
                  <th className="py-2 text-right">متن</th>
                  <th className="py-2 text-right">تاریخ</th>
                  <th className="py-2 text-right">وضعیت</th>
                  <th className="py-2 text-right">اقدامات</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((c) => (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="py-2 pr-2">
                      <span className="font-medium">{c.author_name}</span>
                      <br />
                      <span className="text-xs text-gray-500">{c.author_email}</span>
                    </td>
                    <td className="py-2 pr-2 max-w-xs truncate">{c.content}</td>
                    <td className="py-2 pr-2 text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('fa-IR')}</td>
                    <td className="py-2 pr-2">
                      {c.is_approved ? (
                        <span className="text-green-400">تأیید شده</span>
                      ) : (
                        <span className="text-yellow-400">در انتظار تأیید</span>
                      )}
                    </td>
                    <td className="py-2 pr-2 flex gap-2">
                      {!c.is_approved && (
                        <button
                          type="button"
                          onClick={() => setApproved(c.id, true)}
                          disabled={savingId === c.id}
                          className="text-xs text-primary underline"
                        >
                          تأیید
                        </button>
                      )}
                      {c.is_approved && (
                        <button
                          type="button"
                          onClick={() => setApproved(c.id, false)}
                          disabled={savingId === c.id}
                          className="text-xs text-gray-400 underline"
                        >
                          لغو تأیید
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteComment(c.id)}
                        disabled={savingId === c.id}
                        className="text-xs text-red-400 underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {comments.length === 0 && (
              <p className="text-gray-400 py-4 text-center">هنوز نظری ثبت نشده.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
