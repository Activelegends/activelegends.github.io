import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminQuickNav from '../../components/AdminQuickNav';
import { defaultAvatarsService, type DefaultAvatar } from '../../services/defaultAvatarsService';

const ADMIN_EMAIL = 'active.legendss@gmail.com';

export default function DefaultAvatarsAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<DefaultAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);
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
      const data = await defaultAvatarsService.getList();
      setList(data);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await defaultAvatarsService.add(newUrl.trim(), list.length);
      setNewUrl('');
      load();
    } catch (err: any) {
      setError(err.message || 'خطا در افزودن');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('این لوگو حذف شود؟')) return;
    setSaving(true);
    setError(null);
    try {
      await defaultAvatarsService.delete(id);
      load();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف');
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto p-4 pt-24 pb-16">
      <AdminQuickNav />
      <div className="bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-2">لوگوهای پیش‌فرض کاربران</h1>
        <p className="text-gray-400 text-sm mb-6">
          این لوگوها برای کاربران بدون لاگین یا بدون عکس پروفایل در نظرات بلاگ و سایر بخش‌ها نمایش داده می‌شوند. می‌توانید یک یا چند آدرس تصویر اضافه کنید.
        </p>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="آدرس تصویر (URL)"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          />
          <button type="submit" className="btn-primary text-sm px-4 py-2" disabled={saving}>
            افزودن
          </button>
        </form>
        {loading ? (
          <p className="text-gray-400">در حال بارگذاری...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-400 text-sm">هنوز لوگویی اضافه نشده. با دکمه بالا یکی اضافه کنید.</p>
        ) : (
          <ul className="space-y-3">
            {list.map((item) => (
              <li key={item.id} className="flex items-center gap-4 bg-black/30 rounded-xl p-3 border border-white/10">
                <img
                  src={item.url}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-white/20"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-gray-300 text-sm truncate flex-1">{item.url}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
