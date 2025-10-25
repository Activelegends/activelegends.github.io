import { motion } from 'framer-motion';
import ScrollIndicator from './ScrollIndicator';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Hero() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user } = useAuth();

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // تنظیمات انیمیشن برای موبایل و دسکتاپ
  const isMobile = window.innerWidth < 640;
  const animationConfig = {
    initial: { opacity: 0, y: isMobile ? 10 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: isMobile ? 0.5 : 0.8 }
  };

  return (
    <>
      <Helmet>
        <title>Active Legend | استودیو بازی‌سازی و جامعه گیمرها</title>
        <meta name="description" content="Active Legend - استودیو مستقل بازی‌سازی و جامعه آنلاین برای گیمرها و توسعه‌دهندگان ایرانی. بهترین بازی‌های موبایل و کامپیوتر." />
        <meta name="keywords" content="Active Legend, بازی‌سازی, استودیو بازی, بازی ایرانی, بازی موبایل, بازی کامپیوتر, جامعه گیمرها, توسعه‌دهنده بازی" />
        <link rel="canonical" href="https://activelegend.ir/" />
        <meta property="og:title" content="Active Legend | استودیو بازی‌سازی و جامعه گیمرها" />
        <meta property="og:description" content="استودیو مستقل بازی‌سازی و جامعه آنلاین برای گیمرها و توسعه‌دهندگان ایرانی" />
        <meta property="og:url" content="https://activelegend.ir/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://activelegend.ir/AE%20logo.svg" />
        <meta name="twitter:title" content="Active Legend | استودیو بازی‌سازی و جامعه گیمرها" />
        <meta name="twitter:description" content="استودیو مستقل بازی‌سازی و جامعه آنلاین برای گیمرها و توسعه‌دهندگان ایرانی" />
        <meta name="twitter:image" content="https://activelegend.ir/AE%20logo.svg" />
      </Helmet>
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-container">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black/95"></div>
      
      <motion.div
        {...animationConfig}
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        <motion.img
          src={import.meta.env.BASE_URL + 'AE logo.svg'}
          alt="Active Legend"
          className="w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto mb-8"
          initial={{ scale: isMobile ? 0.8 : 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: isMobile ? "tween" : "spring",
            duration: isMobile ? 0.5 : 1 
          }}
        />
        
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 text-white bg-clip-text"
          {...animationConfig}
          transition={{ ...animationConfig.transition, delay: isMobile ? 0.1 : 0.3 }}
        >
          به دنیای اکتیو لجند خوش آمدید
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl mb-8 text-gray-300"
          {...animationConfig}
          transition={{ ...animationConfig.transition, delay: isMobile ? 0.2 : 0.5 }}
        >
          توسعه‌دهنده بازی‌های موبایل و کامپیوتر
        </motion.p>
        
        <motion.div
          className="space-x-4 space-x-reverse"
          {...animationConfig}
          transition={{ ...animationConfig.transition, delay: isMobile ? 0.3 : 0.7 }}
        >
          <Link to="/games">
            <motion.button
              className="btn-primary"
              whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
              whileTap={{ scale: isMobile ? 0.98 : 0.95 }}
            >
              مشاهده بازی‌ها
            </motion.button>
          </Link>
          {!user && (
            <>
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                whileTap={{ scale: isMobile ? 0.98 : 0.95 }}
                onClick={() => handleAuthClick('signup')}
              >
                ثبت‌نام
              </motion.button>
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                whileTap={{ scale: isMobile ? 0.98 : 0.95 }}
                onClick={() => handleAuthClick('login')}
              >
                ورود
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
      
      <ScrollIndicator />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
      </header>
    </>
  );
}