import { supabase } from '../lib/supabaseClient';

export interface BlogComment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export const blogCommentService = {
  async getForPost(postId: string): Promise<BlogComment[]> {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as BlogComment[];
  },

  async add(postId: string, payload: { author_name: string; author_email: string; content: string }): Promise<BlogComment> {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        blog_post_id: postId,
        author_name: payload.author_name.trim(),
        author_email: payload.author_email.trim(),
        content: payload.content.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as BlogComment;
  },

  /** فقط برای ادمین: همه نظرات (از جمله تأییدنشده) */
  async getAllForAdmin(): Promise<BlogComment[]> {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as BlogComment[];
  },

  async updateApproved(id: string, is_approved: boolean): Promise<void> {
    const { error } = await supabase
      .from('blog_comments')
      .update({ is_approved })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('blog_comments').delete().eq('id', id);
    if (error) throw error;
  },
};
