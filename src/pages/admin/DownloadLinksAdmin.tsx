import React, { useEffect, useState } from 'react';
import { downloadLinksService } from '../../services/downloadLinksService';
import type { DownloadLink } from '../../services/downloadLinksService';
import { downloadAdsService, type DownloadAd, type DownloadAdPosition } from '../../services/downloadAdsService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminQuickNav from '../../components/AdminQuickNav';

type Tab = 'links' | 'ads';

export default function DownloadLinksAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('links');

  const [links, setLinks] = useState<DownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DownloadLink>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [ads, setAds] = useState<DownloadAd[]>([]);
  const [adForm, setAdForm] = useState<Partial<DownloadAd>>({
    position: 'top',
    is_active: true,
    priority: 1,
  } as Partial<DownloadAd>);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.email !== 'active.legendss@gmail.com') {
      navigate('/');
      return;
    }
    loadLinks();
    loadAds();
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

  const loadAds = async () => {
    try {
      const data = await downloadAdsService.getAllAds();
      setAds(data);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت تبلیغات دانلود');
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

  const handleAdChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    if (type === 'checkbox') {
      setAdForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'priority') {
      setAdForm((prev) => ({ ...prev, priority: Number(value) || 1 }));
    } else if (name === 'position') {
      setAdForm((prev) => ({ ...prev, position: value as DownloadAdPosition }));
    } else {
      setAdForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (link: DownloadLink) => {
    setForm(link);
    setEditingId(link.id);
  };

  const resetAdForm = () => {
    setAdForm({
      position: 'top',
      is_active: true,
      priority: 1,
      title: '',
      html_snippet: '',
    } as Partial<DownloadAd>);
    setEditingAdId(null);
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.html_snippet) {
      setError('کد HTML تبلیغ الزامی است.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const saved = await downloadAdsService.upsertAd(adForm as any);
      if (editingAdId) {
        setAds((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
      } else {
        setAds((prev) => [...prev, saved]);
      }
      resetAdForm();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره تبلیغ دانلود');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAd = (ad: DownloadAd) => {
    setEditingAdId(ad.id);
    setAdForm(ad);
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm('آیا از حذف این تبلیغ مطمئن هستید؟')) return;
    setSaving(true);
    try {
      await downloadAdsService.deleteAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
      if (editingAdId === id) resetAdForm();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف تبلیغ دانلود');
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-3xl mx-auto p-4 pt-24 pb-16">
      <AdminQuickNav />
      <div className="bg-white/10 rounded-2xl shadow-lg p-8 border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">مدیریت دانلود و تبلیغات</h1>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              tab === 'links'
                ? 'bg-primary text-black font-bold'
                : 'bg-black/40 text-gray-200 border border-white/10'
            }`}
            onClick={() => setTab('links')}
          >
            لینک‌ها
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              tab === 'ads'
                ? 'bg-primary text-black font-bold'
                : 'bg-black/40 text-gray-200 border border-white/10'
            }`}
            onClick={() => setTab('ads')}
          >
            تبلیغات دانلود
          </button>
        </div>

        {tab === 'links' && (
          <>
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
                        href={`${window.location.origin}/download/${link.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline break-all"
                      >{`${window.location.origin}/download/${link.id}`}</a>
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
          </>
        )}

        {tab === 'ads' && (
          <>
            {error && <div className="text-red-400 text-center mb-4">{error}</div>}
            <form onSubmit={handleAdSubmit} className="mb-8 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  name="position"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  value={adForm.position || 'top'}
                  onChange={handleAdChange}
                >
                  <option value="top">باکس بالای کارت دانلود</option>
                  <option value="after_button">زیر دکمه دانلود</option>
                  <option value="page_bottom">پایین صفحه (زیر کارت)</option>
                </select>
                <input
                  name="title"
                  type="text"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm md:col-span-2"
                  placeholder="عنوان داخلی (برای مدیریت، نمایش داده نمی‌شود)"
                  value={adForm.title || ''}
                  onChange={handleAdChange}
                />
              </div>
              <input
                name="priority"
                type="number"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-32"
                placeholder="اولویت (۱ کمترین)"
                value={adForm.priority ?? 1}
                onChange={handleAdChange}
              />
              <textarea
                name="html_snippet"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono"
                rows={6}
                placeholder="کد کامل HTML/JS یکتانت یا تبلیغ سفارشی. بدون هیچ تغییری همینجا پیست کنید."
                value={adForm.html_snippet || ''}
                onChange={handleAdChange}
              />
              <label className="flex items-center gap-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={adForm.is_active ?? true}
                  onChange={handleAdChange}
                />
                <span>فعال</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="btn-primary text-sm px-4 py-2"
                  disabled={saving}
                >
                  {editingAdId ? 'ذخیره تبلیغ' : 'افزودن تبلیغ'}
                </button>
                {editingAdId && (
                  <button
                    type="button"
                    onClick={resetAdForm}
                    className="text-xs text-gray-300 underline"
                  >
                    لغو و ایجاد تبلیغ جدید
                  </button>
                )}
              </div>
            </form>

            <div className="mb-6 p-4 rounded-xl border border-yellow-400/40 bg-black/40 text-xs md:text-sm text-gray-100 space-y-3">
              <h2 className="text-sm md:text-base font-bold text-yellow-300">راهنمای یکتانت برای صفحه‌های دانلود</h2>
              <p className="text-gray-300">
                کد اصلی یکتانت (اسکریپت) یک‌بار در
                <code className="mx-1 px-1 rounded bg-white/10 text-[11px]">public/index.html</code>
                و داخل تگ
                <code className="mx-1 px-1 rounded bg-white/10 text-[11px]">&lt;head&gt;</code>
                قرار گرفته است. اینجا فقط کد جایگاه‌هایی را که از یکتانت می‌گیرید بدون هیچ تغییری پیست کنید.
              </p>
              <p className="text-gray-300">
                توجه: کلاس‌ها و IDهایی که ما اضافه می‌کنیم (<code>sponsor-box</code> و ...)، کلمه‌ای مثل
                <code>ad</code>، <code>ads</code> یا <code>banner</code> ندارند تا توسط ad-blockerها مسدود نشوند.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm text-gray-200">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 text-right">عنوان</th>
                    <th className="py-2 text-right">position</th>
                    <th className="py-2 text-right">اولویت</th>
                    <th className="py-2 text-right">فعال</th>
                    <th className="py-2 text-right">اقدامات</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id} className="border-b border-white/5">
                      <td className="py-1 pr-1">{ad.title}</td>
                      <td className="py-1 pr-1 text-xs text-gray-400">{ad.position}</td>
                      <td className="py-1 pr-1">{ad.priority}</td>
                      <td className="py-1 pr-1">{ad.is_active ? 'بله' : '-'}</td>
                      <td className="py-1 pr-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditAd(ad)}
                          className="text-xs text-primary underline"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-xs text-red-400 underline"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-3 text-center text-gray-400">
                        هنوز تبلیغی برای صفحه‌های دانلود ثبت نشده است.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
