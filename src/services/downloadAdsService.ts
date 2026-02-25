import { supabase } from '../lib/supabaseClient';

export type DownloadAdPosition = 'top' | 'after_button' | 'page_bottom';

export interface DownloadAd {
  id: string;
  position: DownloadAdPosition;
  title: string;
  html_snippet: string;
  is_active: boolean;
  priority: number;
}

export const downloadAdsService = {
  async getActiveAds(): Promise<DownloadAd[]> {
    const { data, error } = await supabase
      .from('download_ads')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });
    if (error) throw error;
    return (data || []) as DownloadAd[];
  },

  async getAllAds(): Promise<DownloadAd[]> {
    const { data, error } = await supabase
      .from('download_ads')
      .select('*')
      .order('position', { ascending: true })
      .order('priority', { ascending: true });
    if (error) throw error;
    return (data || []) as DownloadAd[];
  },

  async upsertAd(ad: Partial<DownloadAd>): Promise<DownloadAd> {
    const { data, error } = await supabase
      .from('download_ads')
      .upsert(ad, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as DownloadAd;
  },

  async deleteAd(id: string): Promise<void> {
    const { error } = await supabase.from('download_ads').delete().eq('id', id);
    if (error) throw error;
  },
};

