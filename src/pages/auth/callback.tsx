import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ok' | 'fail'>('loading');

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        // بعد از کلیک روی لینک تأیید ایمیل، توکن‌ها در هش URL هستند.
        // صبر کوتاه تا کلاینت Supabase هش را پردازش و سشن را ذخیره کند.
        await new Promise((r) => setTimeout(r, 300));
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;
        if (error) {
          setStatus('fail');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        if (session) {
          setStatus('ok');
          navigate('/', { replace: true });
        } else {
          setStatus('fail');
          setTimeout(() => navigate('/', { replace: true }), 2000);
        }
      } catch (e) {
        console.error('Auth callback error', e);
        if (mounted) {
          setStatus('fail');
          setTimeout(() => navigate('/', { replace: true }), 2000);
        }
      }
    };

    run();
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="mb-6">
          <img src="/AE logo.svg" alt="Active Legend" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'loading' && 'در حال پردازش...'}
            {status === 'ok' && 'ورود با موفقیت انجام شد'}
            {status === 'fail' && 'خطا در تأیید'}
          </h1>
          <p className="text-gray-400">
            {status === 'loading' && 'لطفاً صبر کنید تا وارد حساب کاربری خود شوید.'}
            {status === 'ok' && 'در حال انتقال به صفحه اصلی...'}
            {status === 'fail' && 'در حال انتقال به صفحه اصلی. اگر تازه ثبت نام کردید، لینک تأیید را در ایمیل بزنید و دوباره وارد شوید.'}
          </p>
        </div>

        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
