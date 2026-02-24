import React, { useEffect, useState } from 'react';
import { downloadLinksService } from '../../services/downloadLinksService';
import type { DownloadLink } from '../../services/downloadLinksService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminQuickNav from '../../components/AdminQuickNav';

export default function DownloadLinksAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<DownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DownloadLink>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.email !== 'active.legendss@gmail.com') {
      navigate('/');
      return;
    }
    loadLinks();
    // eslint-disable-next-line
  }, [user]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await downloadLinksService.getAll();
      setLinks(data);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت لینک‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await downloadLinksService.update(editingId, form);
      } else {
        if (!form.id || !form.url) throw new Error('آیدی و لینک الزامی است');
        await downloadLinksService.add(form as DownloadLink);
      }
      setForm({});
      setEditingId(null);
      await loadLinks();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (link: DownloadLink) => {
    setForm(link);
    setEditingId(link.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا مطمئن هستید؟')) return;
    setSaving(true);
    try {
      await downloadLinksService.remove(id);
      await loadLinks();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pt-24">
      <AdminQuickNav />
      <div className="bg-white/10 rounded-2xl shadow-lg p-8 border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">مدیریت لینک‌های دانلود</h1>
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="id"
            type="text"
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="آیدی (مثلاً game1)"
            value={form.id || ''}
            onChange={handleChange}
            required
            disabled={!!editingId}
          />
          <input
            name="url"
            type="text"
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="لینک دانلود"
            value={form.url || ''}
            onChange={handleChange}
            required
          />
          <input
            name="title"
            type="text"
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="عنوان (اختیاری)"
            value={form.title || ''}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="btn-primary col-span-1 md:col-span-3 mt-2"
            disabled={saving}
          >
            {editingId ? 'ذخیره ویرایش' : 'افزودن لینک'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary col-span-1 md:col-span-3 mt-2"
              onClick={() => { setForm({}); setEditingId(null); }}
            >
              انصراف از ویرایش
            </button>
          )}
        </form>
        {error && <div className="text-red-400 text-center mb-4">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-400">در حال بارگذاری...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white">
              <thead>
                <tr className="bg-black/30">
                  <th className="p-2">آیدی</th>
                  <th className="p-2">لینک دانلود نهایی</th>
                  <th className="p-2">لینک صفحه شمارش/تبلیغ</th>
                  <th className="p-2">عنوان</th>
                  <th className="p-2">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-2 font-mono">{link.id}</td>
                    <td className="p-2 truncate max-w-[120px]">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{link.url}</a>
                      <button
                        className="ml-2 text-xs text-gray-400 hover:text-primary"
                        onClick={() => navigator.clipboard.writeText(link.url)}
                        title="کپی لینک نهایی"
                      >کپی</button>
                    </td>
                    <td className="p-2 truncate max-w-[120px]">
                      <a
                        href={`${window.location.origin}/#/download/${link.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline break-all"
                      >{`${window.location.origin}/#/download/${link.id}`}</a>
                      <button
                        className="ml-2 text-xs text-gray-400 hover:text-primary"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/download/${link.id}`)}
                        title="کپی لینک صفحه تبلیغ"
                      >کپی</button>
                    </td>
                    <td className="p-2">{link.title || '-'}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="btn-secondary px-2 py-1 text-xs"
                        onClick={() => handleEdit(link)}
                        disabled={saving}
                      >ویرایش</button>
                      <button
                        className="btn-secondary px-2 py-1 text-xs text-red-400 border-red-400"
                        onClick={() => handleDelete(link.id)}
                        disabled={saving}
                      >حذف</button>
                    </td>
                  </tr>
                ))}
                {links.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-4">لینکی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 