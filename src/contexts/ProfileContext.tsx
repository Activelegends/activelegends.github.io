import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { userProfileService, type UserProfile } from '../services/userProfileService';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const metadata = user.user_metadata as { full_name?: string; avatar_url?: string } | undefined;
      const p = await userProfileService.ensureProfile(user.id, user.email ?? '', {
        display_name: metadata?.full_name ?? undefined,
        profile_image_url: metadata?.avatar_url ?? undefined,
      });
      setProfile(p);
    } catch (err) {
      console.error('Profile load error', err);
      const fallback = await userProfileService.getProfile(user.id);
      setProfile(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    refreshProfile();
  }, [user?.id]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (ctx === undefined) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
