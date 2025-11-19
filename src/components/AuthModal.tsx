import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(isLogin);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setAcceptedTerms(initialMode === 'login');
  }, [initialMode]);

  const validateForm = () => {
    if (!email || !password) {
      setError('لطفاً تمام فیلدها را پر کنید.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید.');
      return false;
    }
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return false;
    }
    if (!acceptedTerms) {
      setError('برای ادامه باید شرایط را بپذیرید.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطایی رخ داد. لطفا دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await signInWithGoogle({
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'خطایی در ورود با گوگل رخ داد. لطفا دوباره تلاش کنید.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <img 
                src="/AE logo.svg" 
                alt="Active Legend" 
                className="w-16 h-16 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'ورود به حساب کاربری' : 'ثبت نام'}
              </h2>
              <p className="text-gray-400 mt-2">
                {isLogin ? 'به Active Legend خوش آمدید' : 'حساب کاربری جدید بسازید'}
              </p>
            </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    ایمیل
                  </label>
                  <input
                    type="email"
                  id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="example@email.com"
                  required
                    dir="ltr"
                  />
                </div>

                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    رمز عبور
                  </label>
                  <input
                    type="password"
                  id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="••••••••"
                    required
                    minLength={6}
                  dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2 mb-1">
  <input
    id="accept-terms"
    type="checkbox"
    checked={acceptedTerms}
    onChange={e => setAcceptedTerms(e.target.checked)}
    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
    style={{ accentColor: '#2563eb' }}
  />
  <label htmlFor="accept-terms" className="text-[11px] text-gray-400 select-none cursor-pointer">
    <a href="https://activelegend.ir/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 transition">
      من شرایط را خوانده‌ام و آن را قبول دارم
    </a>
  </label>
                </div>

                {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
                  {error}
                </div>
                )}

                <button
                  type="submit"
                disabled={!acceptedTerms || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    در حال پردازش...
                  </div>
                ) : isLogin ? 'ورود' : 'ثبت نام'}
                </button>
            </form>

            <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">یا</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
              disabled={!acceptedTerms || loading}
              className="w-full bg-white text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
                  <span>ورود با گوگل</span>
                </button>

            <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                {isLogin ? 'حساب کاربری ندارید؟ ثبت نام کنید' : 'قبلاً ثبت نام کرده‌اید؟ وارد شوید'}
                </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};