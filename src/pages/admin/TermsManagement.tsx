import React, { useState, useEffect } from 'react';
import { termsService } from '../../services/termsService';
import type { TermsAndConditions } from '../../types/terms';
import DOMPurify from 'dompurify';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminQuickNav from '../../components/AdminQuickNav';

export default function TermsManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTerms, setNewTerms] = useState({
    title: '',
    content_html: '',
    version: 1
  });

  useEffect(() => {
    if (user?.email !== 'active.legendss@gmail.com') {
      navigate('/');
      return;
    }
    loadTerms();
  }, [user, navigate]);

  const loadTerms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('terms_and_conditions')
        .select('*')
        .order('version', { ascending: false });

      if (error) throw error;
      setTerms((data || []) as unknown as TermsAndConditions[]);
    } catch (err) {
      console.error('Error loading terms:', err);
      setError('خطا در بارگذاری قوانین و مقررات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await termsService.createNewTerms({
        ...newTerms,
        is_active: true
      });
      setIsCreating(false);
      setNewTerms({
        title: '',
        content_html: '',
        version: terms.length > 0 ? Math.max(...terms.map(t => t.version)) + 1 : 1
      });
      await loadTerms();
    } catch (err) {
      console.error('Error creating terms:', err);
      setError('خطا در ایجاد قوانین و مقررات جدید');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTerms = async (termsId: string) => {
    try {
      setLoading(true);
      await termsService.updateTerms(termsId, { is_active: true });
      await loadTerms();
    } catch (err) {
      console.error('Error activating terms:', err);
      setError('خطا در فعال‌سازی قوانین و مقررات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="admin-page-container max-w-4xl mx-auto p-4 pt-24">
      <AdminQuickNav />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">مدیریت قوانین و مقررات</h1>
          <p className="text-gray-600">ایجاد و مدیریت قوانین و مقررات پلتفرم</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-[#F4B744] hover:bg-[#E5A93D] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            ایجاد قوانین جدید
          </span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {isCreating && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">ایجاد قوانین جدید</h2>
          <form onSubmit={handleCreateTerms} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                عنوان
              </label>
              <input
                type="text"
                id="title"
                value={newTerms.title}
                onChange={(e) => setNewTerms({ ...newTerms, title: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#F4B744] focus:border-transparent transition-all duration-200"
                placeholder="عنوان قوانین و مقررات"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                محتوا
              </label>
              <textarea
                id="content"
                value={newTerms.content_html}
                onChange={(e) => setNewTerms({ ...newTerms, content_html: e.target.value })}
                required
                rows={12}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#F4B744] focus:border-transparent transition-all duration-200 bg-gray-50 text-gray-700 placeholder-gray-400"
                placeholder="محتوی قوانین و مقررات را وارد کنید..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F4B744] hover:bg-[#E5A93D] shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال ایجاد...
                  </span>
                ) : (
                  'ایجاد قوانین جدید'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {terms.map((term) => (
          <div
            key={term.id}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-200 hover:shadow-xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{term.title}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>نسخه {term.version}</span>
                  <span className="mx-2">•</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(term.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
              {!term.is_active && (
                <button
                  onClick={() => handleActivateTerms(term.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  فعال‌سازی
                </button>
              )}
            </div>

            <div
              className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-li:text-gray-900 prose-a:text-[#F4B744] prose-a:no-underline hover:prose-a:underline bg-gray-50 p-6 rounded-lg border border-gray-200"
              style={{ color: '#111827' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(term.content_html) }}
            />

            {term.is_active && (
              <div className="mt-6 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  فعال
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 