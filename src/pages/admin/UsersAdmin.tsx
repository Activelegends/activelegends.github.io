import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminQuickNav from '../../components/AdminQuickNav';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const ADMIN_EMAIL = 'active.legendss@gmail.com';

type UserRow = {
  id: string;
  email: string | null;
};

export default function UsersAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
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

      // NOTE: With anon key we can't list Supabase Auth users.
      // We show "active users" inferred from comments table relations.
      const { data, error } = await supabase
        .from('comments')
        .select(`user:user_id ( id, email )`)
        .limit(1000);

      if (error) throw error;

      const map = new Map<string, UserRow>();
      (data || []).forEach((row: any) => {
        const u = row?.user;
        if (u?.id) map.set(u.id, { id: u.id, email: u.email ?? null });
      });

      setRows(Array.from(map.values()));
    } catch (err: any) {
      console.error('Error loading users', err);
      setError(err.message || 'خطا در دریافت کاربران');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((r) => (r.email || '').toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [rows, query]);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">
        دسترسی فقط برای ادمین مجاز است.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <AdminQuickNav />
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">مدیریت کاربران</h1>
          <button className="btn-secondary" onClick={load} disabled={loading}>
            بروزرسانی
          </button>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-100 rounded-xl p-4 text-sm mb-4">
          نکته: با کلید عمومی (Anon) امکان لیست‌کردن کاربران Supabase Auth وجود ندارد. این لیست «کاربران فعال» را از
          روی ارتباطات جدول نظرات استخراج می‌کند.
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
            placeholder="جستجو با ایمیل یا id..."
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
                  <th className="py-3 px-3 text-right">ایمیل</th>
                  <th className="py-3 px-3 text-right">شناسه</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 px-3">{r.email || '-'}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{r.id}</td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-gray-400">
                      موردی یافت نشد.
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

