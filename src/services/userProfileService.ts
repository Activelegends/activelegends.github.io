import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  profile_image_url: string | null;
}

export const userProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, profile_image_url')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as UserProfile | null;
  },

  async ensureProfile(userId: string, email: string, metadata?: { display_name?: string; profile_image_url?: string }): Promise<UserProfile> {
    const { data: existing } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
    if (existing) {
      const updated = await this.updateProfile(userId, {
        display_name: metadata?.display_name ?? undefined,
        profile_image_url: metadata?.profile_image_url ?? undefined,
      });
      return updated ?? (await this.getProfile(userId))!;
    }
    const { data: inserted, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email || null,
        display_name: metadata?.display_name ?? null,
        profile_image_url: metadata?.profile_image_url ?? null,
      })
      .select('id, email, display_name, profile_image_url')
      .single();
    if (error) throw error;
    return inserted as UserProfile;
  },

  async updateProfile(userId: string, payload: { display_name?: string; profile_image_url?: string }): Promise<UserProfile | null> {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.display_name !== undefined) updates.display_name = payload.display_name;
    if (payload.profile_image_url !== undefined) updates.profile_image_url = payload.profile_image_url;
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, email, display_name, profile_image_url')
      .single();
    if (error) throw error;
    return data as UserProfile;
  },
};
