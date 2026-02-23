import { supabase } from '../lib/supabaseClient';

export interface BlogComment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string;
  author_image_url?: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  user_id?: string | null;
  parent_id?: string | null;
  replies?: BlogComment[];
  likes_count?: number;
  liked?: boolean;
}

export const blogCommentService = {
  async getForPost(postId: string, currentUserId?: string | null): Promise<BlogComment[]> {
    const { data: rows, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    const all = (rows || []) as BlogComment[];

    const byParent = new Map<string, BlogComment[]>();
    all.forEach((c) => {
      const key = c.parent_id ?? 'root';
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    });

    const MAX_DEPTH = 10;
    const buildTree = (parentKey: string, depth: number): BlogComment[] => {
      if (depth > MAX_DEPTH) return [];
      return (byParent.get(parentKey) || []).map((c) => ({
        ...c,
        replies: buildTree(c.id, depth + 1),
      }));
    };

    const tree = buildTree('root', 0);

    const safeGetLikesCount = async (id: string): Promise<number> => {
      try {
        return await this.getLikesCount(id);
      } catch {
        return 0;
      }
    };
    const safeHasLiked = async (id: string, uid: string): Promise<boolean> => {
      try {
        return await this.hasLiked(id, uid);
      } catch {
        return false;
      }
    };

    const attachLikes = async (node: BlogComment): Promise<BlogComment> => ({
      ...node,
      likes_count: await safeGetLikesCount(node.id),
      liked: currentUserId ? await safeHasLiked(node.id, currentUserId) : false,
      replies: await Promise.all((node.replies || []).map(attachLikes)),
    });

    return Promise.all(tree.map(attachLikes));
  },

  async getLikesCount(commentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('blog_comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);
    if (error) throw error;
    return count ?? 0;
  },

  async hasLiked(commentId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('blog_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    const liked = await this.hasLiked(commentId, userId);
    if (liked) {
      await supabase.from('blog_comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
      const count = await this.getLikesCount(commentId);
      return { liked: false, count };
    } else {
      await supabase.from('blog_comment_likes').insert({ comment_id: commentId, user_id: userId });
      const count = await this.getLikesCount(commentId);
      return { liked: true, count };
    }
  },

  async add(
    postId: string,
    payload: {
      author_name: string;
      author_email: string;
      content: string;
      user_id?: string | null;
      parent_id?: string | null;
      author_image_url?: string | null;
    }
  ): Promise<BlogComment> {
    const insert: Record<string, unknown> = {
      blog_post_id: postId,
      author_name: payload.author_name.trim(),
      author_email: payload.author_email.trim(),
      content: payload.content.trim(),
    };
    if (payload.user_id) insert.user_id = payload.user_id;
    if (payload.parent_id) insert.parent_id = payload.parent_id;
    if (payload.author_image_url) insert.author_image_url = payload.author_image_url;

    const { data, error } = await supabase.from('blog_comments').insert(insert).select().single();
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
    const { error } = await supabase.from('blog_comments').update({ is_approved }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('blog_comments').delete().eq('id', id);
    if (error) throw error;
  },
};
