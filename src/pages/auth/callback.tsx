import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Redirect to home page after successful authentication
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        // Redirect to home page even if there's an error
        navigate('/', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="mb-6">
          <img 
            src="/AE logo.svg" 
            alt="Active Legend" 
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">در حال پردازش...</h1>
          <p className="text-gray-400">لطفاً صبر کنید تا وارد حساب کاربری خود شوید.</p>
        </div>
        
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="h-full bg-blue-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
} 