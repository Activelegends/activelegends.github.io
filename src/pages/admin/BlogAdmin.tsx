import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { blogService, blogAdsService, type BlogPost, type BlogAd, type BlogLang } from '../../services/blogService';
import AdminQuickNav from '../../components/AdminQuickNav';

type Tab = 'posts' | 'ads';

const ADMIN_EMAIL = 'active.legendss@gmail.com';

function parseTagsInput(value: string): string[] {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function BlogAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('posts');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [ads, setAds] = useState<BlogAd[]>([]);

  const [postForm, setPostForm] = useState<Partial<BlogPost>>({
    lang: 'fa',
    is_published: true,
    is_featured: false,
  });
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [adForm, setAdForm] = useState<Partial<BlogAd>>({
    position: 'hero',
    is_active: true,
    priority: 1,
  });
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }
    const loadAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [allPosts, allAds] = await Promise.all([
          blogService.getAllPosts(),
          blogAdsService.getAllAds(),
        ]);
        setPosts(allPosts);
        setAds(allAds);
      } catch (err: any) {
        console.error('Error loading blog admin data', err);
        setError(err.message || 'خطا در بارگذاری داده‌ها');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [user, navigate]);

  const resetPostForm = () => {
    setPostForm({
      lang: 'fa',
      is_published: true,
      is_featured: false,
      title: '',
      slug: '',
      excerpt: '',
      cover_image_url: '',
      content_html: '',
      tags: [],
    } as Partial<BlogPost>);
    setEditingPostId(null);
  };

  const resetAdForm = () => {
    setAdForm({
      position: 'hero',
      is_active: true,
      priority: 1,
      title: '',
      html_snippet: '',
    } as Partial<BlogAd>);
    setEditingAdId(null);
  };

  const handlePostChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    if (type === 'checkbox') {
      setPostForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'tags_input') {
      setPostForm((prev) => ({ ...prev, tags: parseTagsInput(value) }));
    } else if (name === 'lang') {
      setPostForm((prev) => ({ ...prev, lang: value as BlogLang }));
    } else {
      setPostForm((prev) => ({ ...prev, [name]: value }));
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
    } else {
      setAdForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.slug || !postForm.title) {
      setError('عنوان و slug الزامی است.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const saved = await blogService.upsertPost(postForm as any);
      if (editingPostId) {
        setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        setPosts((prev) => [saved, ...prev]);
      }
      resetPostForm();
    } catch (err: any) {
      console.error('Error saving post', err);
      setError(err.message || 'خطا در ذخیره پست');
    } finally {
      setSaving(false);
    }
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
      const saved = await blogAdsService.upsertAd(adForm as any);
      if (editingAdId) {
        setAds((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
      } else {
        setAds((prev) => [...prev, saved]);
      }
      resetAdForm();
    } catch (err: any) {
      console.error('Error saving ad', err);
      setError(err.message || 'خطا در ذخیره تبلیغ');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostForm({
      ...post,
      tags: post.tags || [],
    });
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('آیا از حذف این پست مطمئن هستید؟')) return;
    try {
      setSaving(true);
      await blogService.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (editingPostId === id) resetPostForm();
    } catch (err: any) {
      console.error('Error deleting post', err);
      setError(err.message || 'خطا در حذف پست');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAd = (ad: BlogAd) => {
    setEditingAdId(ad.id);
    setAdForm(ad);
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm('آیا از حذف این تبلیغ مطمئن هستید؟')) return;
    try {
      setSaving(true);
      await blogAdsService.deleteAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
      if (editingAdId === id) resetAdForm();
    } catch (err: any) {
      console.error('Error deleting ad', err);
      setError(err.message || 'خطا در حذف تبلیغ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pt-24 pb-16">
      <AdminQuickNav />
      <div className="bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
          مدیریت بلاگ و تبلیغات
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            className={`px-3 py-1 rounded-lg text-sm ${
              tab === 'posts'
                ? 'bg-primary text-black font-bold'
                : 'bg-black/40 text-gray-200 border border-white/10'
            }`}
            onClick={() => setTab('posts')}
          >
            پست‌ها
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-sm ${
              tab === 'ads'
                ? 'bg-primary text-black font-bold'
                : 'bg-black/40 text-gray-200 border border-white/10'
            }`}
            onClick={() => setTab('ads')}
          >
            تبلیغات
          </button>
        </div>

        {tab === 'posts' && (
          <>
            <form onSubmit={handlePostSubmit} className="mb-8 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="title"
                  type="text"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="عنوان پست"
                  value={postForm.title || ''}
                  onChange={handlePostChange}
                  required
                />
                <input
                  name="slug"
                  type="text"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="slug (انگلیسی برای URL، مثل devlog-1)"
                  value={postForm.slug || ''}
                  onChange={handlePostChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  name="lang"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  value={postForm.lang || 'fa'}
                  onChange={handlePostChange}
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                </select>
                <input
                  name="cover_image_url"
                  type="text"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm md:col-span-2"
                  placeholder="آدرس تصویر شاخص (اختیاری)"
                  value={postForm.cover_image_url || ''}
                  onChange={handlePostChange}
                />
              </div>
              <textarea
                name="excerpt"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                rows={2}
                placeholder="خلاصه کوتاه برای نمایش در لیست و متا دیسکریپشن"
                value={postForm.excerpt || ''}
                onChange={handlePostChange}
              />
              <textarea
                name="content_html"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono"
                rows={8}
                placeholder="محتوای HTML (می‌توانی از ویرایشگر HTML یا مارک‌داون خروجی بگیری و اینجا قرار دهی)"
                value={postForm.content_html || ''}
                onChange={handlePostChange}
              />
              <input
                name="tags_input"
                type="text"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="تگ‌ها (با کاما جدا کن، مثل: devlog, unity, ai)"
                value={(postForm.tags || []).join(', ')}
                onChange={handlePostChange}
              />
              <div className="flex items-center gap-4 text-sm text-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={postForm.is_published ?? true}
                    onChange={handlePostChange}
                  />
                  <span>منتشر شده</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={postForm.is_featured ?? false}
                    onChange={handlePostChange}
                  />
                  <span>پست ویژه (Hero)</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="btn-primary text-sm px-4 py-2"
                  disabled={saving}
                >
                  {editingPostId ? 'ذخیره پست' : 'افزودن پست'}
                </button>
                {editingPostId && (
                  <button
                    type="button"
                    onClick={resetPostForm}
                    className="text-xs text-gray-300 underline"
                  >
                    لغو و ایجاد پست جدید
                  </button>
                )}
              </div>
            </form>

            {/* Posts table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm text-gray-200">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 text-right">عنوان</th>
                    <th className="py-2 text-right">slug</th>
                    <th className="py-2 text-right">زبان</th>
                    <th className="py-2 text-right">وضعیت</th>
                    <th className="py-2 text-right">ویژه</th>
                    <th className="py-2 text-right">اقدامات</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-b border-white/5">
                      <td className="py-1 pr-1">{p.title}</td>
                      <td className="py-1 pr-1 text-xs text-gray-400">{p.slug}</td>
                      <td className="py-1 pr-1">{p.lang}</td>
                      <td className="py-1 pr-1">{p.is_published ? 'منتشر شده' : 'پیش‌نویس'}</td>
                      <td className="py-1 pr-1">{p.is_featured ? 'بله' : '-'}</td>
                      <td className="py-1 pr-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditPost(p)}
                          className="text-xs text-primary underline"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(p.id)}
                          className="text-xs text-red-400 underline"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-gray-400">
                        هنوز پستی ثبت نشده است.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'ads' && (
          <>
            <form onSubmit={handleAdSubmit} className="mb-8 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  name="position"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  value={adForm.position || 'hero'}
                  onChange={handleAdChange}
                >
                  <option value="hero">بالای بلاگ (پست ویژه)</option>
                  <option value="special">تبلیغ ویژه کنار پست ویژه</option>
                  <option value="inline">تبلیغ داخل صفحه پست</option>
                  <option value="sidebar">سایدبار</option>
                </select>
                <input
                  name="title"
                  type="text"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm md:col-span-2"
                  placeholder="عنوان داخلی برای مدیریت (نمایش داده نمی‌شود)"
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
                placeholder="کد HTML تبلیغ (می‌تواند شامل اسکریپت یکتانت، بنر، iframe و ... باشد)"
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

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm text-gray-200">
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
                      <td className="py-1 pr-1">{ad.is_active ? ' بله' : '-'}</td>
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
                        هنوز تبلیغی ثبت نشده است.
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

