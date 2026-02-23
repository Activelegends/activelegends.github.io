import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, UserPlus } from 'lucide-react';
import AdminQuickNav from '../components/AdminQuickNav';

interface Social {
  icon: string;
  url: string;
  img?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  img_url: string;
  socials: Social[];
}

const ADMIN_EMAIL = 'active.legendss@gmail.com';

const emptyMember: Omit<TeamMember, 'id'> = {
  name: '',
  role: '',
  img_url: '',
  socials: [],
};

export default function TeamAdmin() {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<TeamMember, 'id'>>(emptyMember);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) fetchTeam();
  }, [user]);

  async function fetchTeam() {
    setLoading(true);
    const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
    if (error) setError('خطا در دریافت اعضا');
    setTeam(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyMember);
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(member: TeamMember) {
    setForm({ ...member, socials: member.socials || [] });
    setEditId(member.id);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(emptyMember);
    setError(null);
  }

  function handleSocialChange(idx: number, field: keyof Social, value: string) {
    setForm(f => ({
      ...f,
      socials: f.socials.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    }));
  }
  function addSocial() {
    setForm(f => ({ ...f, socials: [...f.socials, { icon: '', url: '', img: '' }] }));
  }
  function removeSocial(idx: number) {
    setForm(f => ({ ...f, socials: f.socials.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // پاکسازی فیلد img خالی
    const socialsCleaned = form.socials.map(s => ({
      icon: s.icon,
      url: s.url,
      ...(s.img && s.img.length > 0 ? { img: s.img } : {})
    }));
    if (!form.name.trim() || !form.role.trim()) {
      setError('نام و نقش الزامی است');
      return;
    }
    if (editId) {
      // update
      const { error } = await supabase.from('team_members').update({ ...form, socials: socialsCleaned }).eq('id', editId);
      if (error) setError('خطا در ویرایش عضو');
    } else {
      // insert
      const { error } = await supabase.from('team_members').insert([{ ...form, socials: socialsCleaned }]);
      if (error) setError('خطا در افزودن عضو');
    }
    closeModal();
    fetchTeam();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('آیا از حذف این عضو مطمئن هستید؟')) return;
    await supabase.from('team_members').delete().eq('id', id);
    fetchTeam();
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-400">دسترسی فقط برای ادمین مجاز است.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 pt-24">
      <div className="max-w-3xl mx-auto">
        <AdminQuickNav />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-blue-400" /> مدیریت اعضای تیم
          </h1>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold shadow transition-all">
            <Plus className="w-5 h-5" /> افزودن عضو
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-400">در حال بارگذاری...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map(member => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-white/10 relative"
              >
                <img src={member.img_url} alt={member.name} className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white/20 shadow" />
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <span className="text-sm text-gray-300 mb-2">{member.role}</span>
                <div className="flex gap-3 justify-center mt-2 mb-4">
                  {(member.socials || []).map((s, idx) => (
                    <a key={s.icon+idx} href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors">
                      {s.icon === 'github' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" /></svg>}
                      {s.icon === 'linkedin' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v5.597zm0 0"/></svg>}
                      {s.icon === 'instagram' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm6.25 1.25a1 1 0 110 2 1 1 0 010-2z"/></svg>}
                    </a>
                  ))}
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <button onClick={() => openEdit(member)} className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={closeModal} className="absolute top-3 left-3 text-gray-400 hover:text-red-400"><X className="w-6 h-6" /></button>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">{editId ? 'ویرایش عضو' : 'افزودن عضو جدید'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1 text-right">نام</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-right">نقش</label>
                  <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-right">آدرس عکس (URL)</label>
                  <input type="text" value={form.img_url} onChange={e => setForm(f => ({ ...f, img_url: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-right">شبکه‌های اجتماعی</label>
                  {form.socials.map((s, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-center">
                      <input type="text" value={s.icon} onChange={e => handleSocialChange(idx, 'icon', e.target.value)} placeholder="آیکون (github/linkedin/instagram یا custom)" className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white text-xs" />
                      <input type="text" value={s.url} onChange={e => handleSocialChange(idx, 'url', e.target.value)} placeholder="لینک" className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white text-xs" />
                      <input type="text" value={s.img || ''} onChange={e => handleSocialChange(idx, 'img', e.target.value)} placeholder="آدرس عکس دلخواه (اختیاری)" className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white text-xs" />
                      {s.img && <img src={s.img} alt="icon" className="w-6 h-6 rounded-full object-cover" />}
                      <button type="button" onClick={() => removeSocial(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addSocial} className="mt-2 text-blue-400 hover:text-blue-600 flex items-center gap-1"><Plus className="w-4 h-4" /> افزودن شبکه</button>
                </div>
                {error && <div className="text-red-400 text-sm text-right">{error}</div>}
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors">{editId ? 'ذخیره تغییرات' : 'افزودن عضو'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 