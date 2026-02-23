import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Helmet>
        <title>صفحه یافت نشد (۴۰۴) | Active Legend</title>
        <meta name="description" content="صفحه مورد نظر یافت نشد. بازگشت به صفحه اصلی Active Legend." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://activelegend.ir/" />
      </Helmet>
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold mb-4 font-vazirmatn"
        >
          ۴۰۴
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mb-8 font-vazirmatn"
        >
          صفحه مورد نظر یافت نشد
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/')}
          className="bg-[#F4B744] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#F4B744]/90 transition-colors"
        >
          بازگشت به خانه
        </motion.button>
      </div>
    </div>
  );
} 