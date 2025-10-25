import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { termsService } from '../services/termsService';
import type { TermsAndConditions } from '../types/terms';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';

export default function TermsAndConditionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [terms, setTerms] = useState<TermsAndConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      const activeTerms = await termsService.getActiveTerms();
      setTerms(activeTerms);
    } catch (err) {
      console.error('Error loading terms:', err);
      setError('خطا در بارگذاری قوانین و مقررات');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleAccept = async () => {
    if (!user || !terms) return;

    try {
      setIsAccepting(true);
      await termsService.acceptTerms(user.id, terms.version);
      navigate('/');
    } catch (err) {
      console.error('Error accepting terms:', err);
      setError('خطا در ثبت پذیرش قوانین و مقررات');
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border-r-4 border-red-500 text-red-700 px-6 py-4 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (!terms) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-center p-4">
          قوانین و مقررات در دسترس نیست
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>قوانین و مقررات | Active Legend - شرایط استفاده</title>
        <meta name="description" content="قوانین و مقررات استفاده از پلتفرم Active Legend. شرایط و ضوابط استفاده از خدمات بازی‌سازی و جامعه گیمرها." />
        <meta name="keywords" content="قوانین, مقررات, شرایط استفاده, Active Legend, قوانین سایت, شرایط و ضوابط" />
        <link rel="canonical" href="https://activelegend.ir/terms" />
        <meta property="og:title" content="قوانین و مقررات | Active Legend" />
        <meta property="og:description" content="قوانین و مقررات استفاده از پلتفرم Active Legend" />
        <meta property="og:url" content="https://activelegend.ir/terms" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="قوانین و مقررات | Active Legend" />
        <meta name="twitter:description" content="قوانین و مقررات استفاده از پلتفرم Active Legend" />
      </Helmet>
      <div className="max-w-4xl mx-auto p-4 pt-24">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{terms.title}</h1>
          <p className="text-gray-600">لطفاً قوانین و مقررات را با دقت مطالعه کنید</p>
        </div>
        
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-li:text-gray-900 prose-a:text-[#F4B744] prose-a:no-underline hover:prose-a:underline bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 max-h-[60vh] overflow-y-auto"
          style={{ color: '#111827' }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(terms.content_html) }}
        />

        <div className="bg-white rounded-lg p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="agree"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-5 h-5 text-[#F4B744] border-gray-300 rounded focus:ring-[#F4B744]"
            />
            <label htmlFor="agree" className="mr-3 text-gray-900 text-lg font-medium">
              من قوانین و مقررات بالا را مطالعه کرده و با آن‌ها موافقم
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || !isAgreed || isAccepting}
            className={`w-full py-4 px-6 rounded-lg text-white font-medium text-lg transition-all duration-200 transform hover:scale-105 ${
              !hasScrolledToBottom || !isAgreed || isAccepting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#F4B744] hover:bg-[#E5A93D] shadow-lg hover:shadow-xl'
            }`}
          >
            {isAccepting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال ثبت...
              </div>
            ) : (
              'پذیرش و ادامه'
            )}
          </button>

          {!hasScrolledToBottom && (
            <p className="text-yellow-700 text-center mt-4 flex items-center justify-center font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              لطفاً تمام قوانین و مقررات را مطالعه کنید
            </p>
          )}
        </div>
      </div>
      </div>
    </>
  );
} 