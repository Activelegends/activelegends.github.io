import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useDefaultAvatarUrls } from '../hooks/useDefaultAvatarUrls';
import { pickDefaultAvatarUrl } from '../services/defaultAvatarsService';

interface UserAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  className?: string;
}

export function UserAvatar({ size = 'medium', showName = true, className = '' }: UserAvatarProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const defaultAvatarUrls = useDefaultAvatarUrls();

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const profileOrMetaUrl = profile?.profile_image_url || user?.user_metadata?.avatar_url;
  const avatarUrl = profileOrMetaUrl || (defaultAvatarUrls.length ? pickDefaultAvatarUrl(user?.id ?? user?.email ?? '', defaultAvatarUrls) : '/AE logo.svg');
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
          e.currentTarget.src = defaultAvatarUrls.length ? pickDefaultAvatarUrl(user?.id ?? '', defaultAvatarUrls) : '/AE logo.svg';
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