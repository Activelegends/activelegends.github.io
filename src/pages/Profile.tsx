import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { userProfileService } from '../services/userProfileService';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';

const AVATAR_BUCKET = 'avatars';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  useEffect(() => {
    if (profile?.display_name !== undefined) setDisplayName(profile.display_name ?? '');
  }, [profile?.display_name]);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      await userProfileService.updateProfile(user.id, { display_name: displayName.trim() || null });
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      await userProfileService.updateProfile(user.id, { profile_image_url: urlData.publicUrl });
      await refreshProfile();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('bucket') && msg.toLowerCase().includes('not found')) {
        setError('باكت آواتار در Supabase ساخته نشده. در Supabase → Storage یک باکت با نام «avatars» بسازید و آن را Public کنید، یا از کادر «آدرس تصویر» زیر استفاده کنید.');
      } else {
        setError(err.message || 'خطا در آپلود تصویر');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAvatarUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrlInput.trim() || !user?.id) return;
    setSaving(true);
    setError(null);
    try {
      await userProfileService.updateProfile(user.id, { profile_image_url: avatarUrlInput.trim() });
      await refreshProfile();
      setAvatarUrlInput('');
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره آدرس تصویر');
    } finally {
      setSaving(false);
    }
  };

  const displayNameToShow = profile?.display_name?.trim() || user.user_metadata?.full_name || user.email?.split('@')[0] || 'کاربر';
  const avatarUrl = profile?.profile_image_url || user.user_metadata?.avatar_url;

  return (
    <>
      <Helmet>
        <title>پروفایل من | اکتیو لجند</title>
      </Helmet>
      <div className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">پروفایل من</h1>
          <p className="text-gray-400 text-sm mb-6">
            این نام و عکس در کل سایت (نظرات بلاگ، نظرات بازی‌ها و ...) نمایش داده می‌شود.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg px-4 py-2 mb-4 text-sm">
              {error}
            </div>
          )}

          {profileLoading ? (
            <p className="text-gray-400">در حال بارگذاری...</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarUrl || '/images/default-avatar.svg'}
                    alt={displayNameToShow}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => { e.currentTarget.src = '/AE logo.svg'; }}
                  />
                  <label className="absolute bottom-0 right-0 bg-primary text-black rounded-full p-2 cursor-pointer hover:bg-primary/90">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploading}
                    />
                    <span className="text-xs font-bold">{uploading ? '...' : 'عکس'}</span>
                  </label>
                </div>
                <p className="text-gray-500 text-xs">برای تغییر عکس کلیک کنید</p>
              </div>

              <form onSubmit={handleSaveAvatarUrl} className="space-y-2">
                <label className="block text-sm text-gray-300">آدرس تصویر (اگر آپلود کار نکرد، لینک مستقیم تصویر را اینجا بگذارید)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button type="submit" className="btn-primary text-sm px-3 py-2 whitespace-nowrap" disabled={saving || !avatarUrlInput.trim()}>
                    ذخیره لینک
                  </button>
                </div>
              </form>

              <form onSubmit={handleSaveName} className="space-y-3">
                <label className="block text-sm text-gray-300">نام نمایشی (مثل تلگرام)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={user.email?.split('@')[0] || 'نام شما'}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white"
                />
                <button type="submit" className="btn-primary w-full" disabled={saving}>
                  {saving ? 'در حال ذخیره...' : 'ذخیره نام'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
