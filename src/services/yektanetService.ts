import { supabase } from '../lib/supabaseClient';

export type YektanetPosition =
  | 'post_start'
  | 'post_middle'
  | 'post_end'
  | 'sidebar'
  | 'fixed_bottom'
  | 'full_page';

export interface YektanetPlacement {
  id?: string;
  key: string;
  label: string;
  page: 'blog_post';
  position: YektanetPosition;
  format: 'image' | 'text' | 'html';
  enabled: boolean;
  html_code: string;
  insert_after_paragraph?: number | null;
  repeat_every_paragraph?: number | null;
}

export const yektanetService = {
  async getAllPlacements(): Promise<YektanetPlacement[]> {
    const { data, error } = await supabase
      .from('yektanet_placements')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as YektanetPlacement[];
  },

  async upsertPlacement(p: YektanetPlacement): Promise<YektanetPlacement> {
    const payload = {
      ...p,
      page: p.page ?? 'blog_post',
    };
    const { data, error } = await supabase
      .from('yektanet_placements')
      .upsert(payload, { onConflict: 'key' })
      .select()
      .single();
    if (error) throw error;
    return data as YektanetPlacement;
  },

  async getActiveForBlogPost(): Promise<YektanetPlacement[]> {
    const { data, error } = await supabase
      .from('yektanet_placements')
      .select('*')
      .eq('page', 'blog_post')
      .eq('enabled', true);
    if (error) throw error;
    return (data || []) as YektanetPlacement[];
  },
};

