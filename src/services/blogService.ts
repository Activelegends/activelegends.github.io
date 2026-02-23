import { supabase } from '../lib/supabaseClient';

export type BlogLang = 'fa' | 'en';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string | null;
  tags: string[] | null;
  lang: BlogLang;
  is_published: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlogAd {
  id: string;
  position: 'hero' | 'sidebar' | 'inline' | 'special';
  title: string;
  html_snippet: string;
  is_active: boolean;
  priority: number;
  created_at?: string;
}

export const blogService = {
  async getPublishedPosts(options?: { tag?: string; lang?: BlogLang; limit?: number }): Promise<BlogPost[]> {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (options?.lang) {
      query = query.eq('lang', options.lang);
    }
    if (options?.tag) {
      // tags is a text[]; contains() works with Postgres arrays
      query = query.contains('tags', [options.tag]);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as BlogPost[];
  },

  async getFeaturedPost(): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as BlogPost) || null;
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as BlogPost) || null;
  },

  async getRelatedPosts(postId: string, tags: string[] | null, limit = 3): Promise<BlogPost[]> {
    if (!tags || tags.length === 0) return [];

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .neq('id', postId)
      .overlaps('tags', tags)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as BlogPost[];
  },

  // Admin
  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as BlogPost[];
  },

  async upsertPost(post: Partial<BlogPost> & { slug: string }): Promise<BlogPost> {
    const payload = {
      ...post,
      // ensure tags is array or null
      tags: Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags as unknown as string] : null,
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(payload, { onConflict: 'slug' })
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  },
};

export const blogAdsService = {
  async getActiveAds(): Promise<BlogAd[]> {
    const { data, error } = await supabase
      .from('blog_ads')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) throw error;
    return (data || []) as BlogAd[];
  },

  async getAdsForPosition(position: BlogAd['position']): Promise<BlogAd[]> {
    const { data, error } = await supabase
      .from('blog_ads')
      .select('*')
      .eq('is_active', true)
      .eq('position', position)
      .order('priority', { ascending: true });

    if (error) throw error;
    return (data || []) as BlogAd[];
  },

  // Admin
  async getAllAds(): Promise<BlogAd[]> {
    const { data, error } = await supabase.from('blog_ads').select('*').order('priority', { ascending: true });
    if (error) throw error;
    return (data || []) as BlogAd[];
  },

  async upsertAd(ad: Partial<BlogAd>): Promise<BlogAd> {
    const { data, error } = await supabase
      .from('blog_ads')
      .upsert(ad, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data as BlogAd;
  },

  async deleteAd(id: string): Promise<void> {
    const { error } = await supabase.from('blog_ads').delete().eq('id', id);
    if (error) throw error;
  },
};

