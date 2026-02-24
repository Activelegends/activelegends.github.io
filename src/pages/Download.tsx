import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { downloadLinksService } from '../services/downloadLinksService';
import type { DownloadLink } from '../services/downloadLinksService';

const AD_BANNER = (
  <div className="sponsor-box">
    <span className="sponsor-label">تبلیغات</span>
    <div id="pos-article-display-108441" className="w-full flex justify-center items-center"></div>
  </div>
);

export default function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [count, setCount] = useState(10);
  const [notFound, setNotFound] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<DownloadLink | null>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setLink(null);
    downloadLinksService.getById(id).then((data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setLink(data);
      }
      setLoading(false);
      // انیمیشن fade-in بعد از 500ms
      setTimeout(() => {
        setShowContent(true);
      }, 500);
    });
  }, [id]);

  useEffect(() => {
    if (!link) return;
    setCount(10);
    setReady(false);
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setReady(true);
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [link]);

  // اسکریپت یکتانت به‌صورت سراسری در <head> (public/index.html) قرار داده شده است.

  const handleDownload = () => {
    if (link?.url) {
      window.location.href = link.url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 transition-all duration-1000">
        <div className="bg-white/10 border border-primary/40 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-lg text-primary font-bold mb-4">صبر کنید...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="bg-white border border-red-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="text-3xl text-red-400 font-bold mb-4">لینک یافت نشد</div>
          <div className="text-gray-500 mb-6">آیدی وارد شده معتبر نیست یا فایل مورد نظر وجود ندارد.</div>
          <button onClick={() => navigate('/')} className="btn-primary mt-2">بازگشت به خانه</button>
        </div>
      </div>
    );
  }

  const pageTitle = link?.title ? `${link.title} | دانلود | Active Legend` : 'دانلود فایل | Active Legend';
  const pageDescription = link?.title
    ? `دانلود ${link.title} از Active Legend. لینک مستقیم دانلود.`
    : 'صفحه دانلود فایل از Active Legend.';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-all duration-1000 ${
      showContent ? 'bg-white' : 'bg-black'
    }`}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className={`w-full transition-all duration-1000 ${
        showContent 
          ? 'max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-xl p-12' 
          : 'max-w-md bg-white/10 border border-white/10 rounded-2xl p-8'
      } flex flex-col items-center`}>
        <h1 className={`text-2xl font-bold mb-2 text-center transition-all duration-1000 ${
          showContent ? 'text-gray-900' : 'text-white'
        } md:text-4xl`}>
          دانلود فایل
        </h1>
        {link?.title && (
          <div className={`text-primary text-lg font-bold mb-4 text-center transition-all duration-1000 md:text-2xl ${
            showContent ? 'text-primary' : 'text-primary'
          }`}>
            {link.title}
          </div>
        )}
        {showContent && AD_BANNER}
        {!ready ? (
          <>
            <div className={`text-lg font-bold mb-2 transition-all duration-1000 md:text-xl ${
              showContent ? 'text-primary' : 'text-primary'
            }`}>
              دانلود تا <span className="text-2xl md:text-3xl">{count}</span> ثانیه دیگر آغاز می‌شود...
            </div>
            <div className={`w-full rounded-full h-3 mb-4 overflow-hidden transition-all duration-1000 ${
              showContent ? 'bg-gray-200' : 'bg-gray-800'
            }`}>
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${((10 - count) / 10) * 100}%` }}
              ></div>
            </div>
            <div className={`text-sm transition-all duration-1000 md:text-base ${
              showContent ? 'text-gray-500' : 'text-gray-400'
            }`}>
              لطفاً تا پایان شمارش صبر کنید
            </div>
          </>
        ) : (
          <>
            <button
              className="btn-primary w-full py-3 text-lg mt-2 md:py-4 md:text-xl"
              onClick={handleDownload}
            >
              دانلود فایل
            </button>
            <div className={`text-xs mt-4 transition-all duration-1000 md:text-sm ${
              showContent ? 'text-gray-500' : 'text-gray-400'
            }`}>
              اگر دانلود به صورت خودکار آغاز نشد، روی دکمه بالا کلیک کنید.
            </div>
            {showContent && (
              <div className="sponsor-box sponsor-box-bottom">
                <span className="sponsor-label">تبلیغات</span>
                <div id="pos-article-display-108440" className="w-full flex justify-center items-center"></div>
              </div>
            )}
          </>
        )}
      </div>
      {showContent && (
        <div className="sponsor-box sponsor-box-text">
          <span className="sponsor-label">تبلیغات</span>
          <div id="pos-article-text-108405" className="w-full flex justify-center items-center"></div>
        </div>
      )}
    </div>
  );
} 