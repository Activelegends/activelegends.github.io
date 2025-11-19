import { useAuth } from '../contexts/AuthContext';
// نیازی به ایمپورت supabase در اینجا نیست زیرا اطلاعات کاربر از AuthContext می‌آید
// import { supabase } from '../lib/supabase';

interface UserAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  className?: string;
}

export function UserAvatar({ size = 'medium', showName = true, className = '' }: UserAvatarProps) {
  const { user } = useAuth();
  // نیازی به state جداگانه برای userData نیست
  // const [userData, setUserData] = useState<{
  //   avatar_url: string | null;
  //   full_name: string | null;
  // } | null>(null);

  // این useEffect دیگر نیازی به فراخوانی getUser() ندارد
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     if (user) {
  //       try {
  //         console.log('دریافت اطلاعات کاربر از useAuth:', user);
  //         // const { data: { user: userData }, error } = await supabase.auth.getUser();
          
  //         // if (error) {
  //         //   console.error('خطا در دریافت اطلاعات کاربر:', error);
  //         //   throw error;
  //         // }
          
  //         // console.log('اطلاعات کاربر دریافت شد:', userData);
  //         // console.log('آواتار:', userData?.user_metadata?.avatar_url);
  //         // console.log('نام:', userData?.user_metadata?.full_name);
          
  //         // setUserData({
  //         //   avatar_url: userData?.user_metadata?.avatar_url || null,
  //         //   full_name: userData?.user_metadata?.full_name || null
  //         // });
  //       } catch (error) {
  //         console.error('خطا در پردازش اطلاعات کاربر:', error);
  //       }
  //     } else {
  //       console.log('کاربر لاگین نکرده است');
  //     }
  //   };

  //   fetchUserData();
  // }, [user]);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  // دسترسی مستقیم به اطلاعات کاربر از شیء user
  const avatarUrl = user?.user_metadata?.avatar_url || '/images/default-avatar.svg';
  const displayName = user?.user_metadata?.full_name || 'مهمان';

  // لاگ‌های دیباگ قبلی حذف شدند
  // console.log('آواتار نهایی:', avatarUrl);
  // console.log('نام نهایی:', displayName);
  // console.log('Rendering UserAvatar. User status:', !!user);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={avatarUrl}
        alt={displayName}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
        onError={(e) => {
          console.error('خطا در بارگذاری تصویر:', e);
          e.currentTarget.src = '/images/default-avatar.svg';
        }}
      />
      {showName && (
        <span className="text-sm font-medium text-gray-700">
          {displayName}
        </span>
      )}
    </div>
  );
} 