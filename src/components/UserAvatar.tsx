import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';

interface UserAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  className?: string;
}

export function UserAvatar({ size = 'medium', showName = true, className = '' }: UserAvatarProps) {
  const { user } = useAuth();
  const { profile } = useProfile();

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const avatarUrl = profile?.profile_image_url || user?.user_metadata?.avatar_url || '/images/default-avatar.svg';
  const displayName = profile?.display_name?.trim() || user?.user_metadata?.full_name || 'مهمان';

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