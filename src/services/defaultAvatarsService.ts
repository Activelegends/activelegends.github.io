import { supabase } from '../lib/supabaseClient';

export interface DefaultAvatar {
  id: string;
  url: string;
  sort_order: number;
}

export const defaultAvatarsService = {
  async getList(): Promise<DefaultAvatar[]> {
    const { data, error } = await supabase
      .from('default_avatars')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []) as DefaultAvatar[];
  },

  async add(url: string, sortOrder = 0): Promise<DefaultAvatar> {
    const { data, error } = await supabase
      .from('default_avatars')
      .insert({ url: url.trim(), sort_order: sortOrder })
      .select()
      .single();
    if (error) throw error;
    return data as DefaultAvatar;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('default_avatars').delete().eq('id', id);
    if (error) throw error;
  },

  async updateOrder(id: string, sortOrder: number): Promise<void> {
    const { error } = await supabase.from('default_avatars').update({ sort_order: sortOrder }).eq('id', id);
    if (error) throw error;
  },
};

/** انتخاب یک لوگوی پیش‌فرض بر اساس شناسه (مثلاً ایمیل یا id نظر) تا همیشه یکسان باشد */
export function pickDefaultAvatarUrl(identifier: string, urls: string[]): string {
  if (!urls.length) return '/AE logo.svg';
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % urls.length;
  return urls[index];
}
