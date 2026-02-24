import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { commentService } from '../services/commentService';
import type { Comment, CommentFormData, LikeState } from '../types/comment';
import { FaThumbsUp, FaThumbsDown, FaReply, FaThumbtack, FaCheck, FaTimes } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

interface CommentsProps {
  gameId: string;
}

export const Comments: React.FC<CommentsProps> = ({ gameId }) => {
  const { user, session } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [likeStates, setLikeStates] = useState<Record<string, LikeState>>({});

  const isAdmin = user?.email === 'active.legendss@gmail.com';

  // همگام‌سازی نام کاربر گوگل با پروفایل دیتابیس
  useEffect(() => {
    if (user && user.app_metadata?.provider === 'google') {
      const fullName = user.user_metadata?.full_name;
      if (fullName && (!user.user_metadata.display_name || user.user_metadata.display_name === '')) {
        supabase
          .from('users')
          .update({ display_name: fullName })
          .eq('id', user.id)
          .then();
      }
    }
  }, [user]);

  useEffect(() => {
    loadComments();
    const subscription = commentService.subscribeToComments(gameId, handleCommentChange);
    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentService.getComments(gameId);
      console.log('Loaded comments:', data);
      setComments(data);
      
      // Load like states for each comment
      if (session?.user?.id) {
        const likeStates: Record<string, LikeState> = {};
        for (const comment of data) {
          try {
            const hasLiked = await commentService.hasLiked(comment.id, session.user.id);
            likeStates[comment.id] = {
              liked: hasLiked,
              count: comment.likes_count || 0,
              loading: false
            };
          } catch (err) {
            console.error(`Error checking like status for comment ${comment.id}:`, err);
            likeStates[comment.id] = {
              liked: false,
              count: comment.likes_count || 0,
              loading: false
            };
          }
        }
        setLikeStates(likeStates);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('خطا در بارگذاری نظرات. لطفاً صفحه را رفرش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = async (payload: any) => {
    console.log('Comment change payload:', payload);
    try {
      if (payload.eventType === 'INSERT') {
        await loadComments();
      } else if (payload.eventType === 'UPDATE') {
        const updatedComments = comments.map(comment =>
          comment.id === payload.new.id ? { ...comment, ...payload.new } : comment
        );
        setComments(updatedComments);
      } else if (payload.eventType === 'DELETE') {
        setComments(comments.filter(comment => comment.id !== payload.old.id));
      }
    } catch (err) {
      console.error('Error handling comment change:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('برای ارسال نظر لطفاً وارد شوید.');
      return;
    }

    if (!newComment.trim()) {
      setError('لطفاً متن نظر را وارد کنید.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const commentData: CommentFormData = {
        content: newComment.trim(),
        game_id: gameId,
        parent_id: replyingTo,
        user_id: user.id
      };

      await commentService.addComment(commentData);
      setNewComment('');
      setReplyingTo(null);
      await loadComments();
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err.message || 'خطا در ارسال نظر. لطفاً دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) {
      setError('برای حذف نظر لطفاً وارد شوید.');
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      await loadComments();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'خطا در حذف نظر. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      setError('برای لایک کردن نظر لطفاً وارد شوید.');
      return;
    }

    try {
      setLikeStates(prev => ({
        ...prev,
        [commentId]: { ...prev[commentId], loading: true }
      }));

      await commentService.toggleLike(commentId, user.id);
      const hasLiked = await commentService.hasLiked(commentId, user.id);
      
      setLikeStates(prev => ({
        ...prev,
        [commentId]: {
          liked: hasLiked,
          count: hasLiked ? (prev[commentId]?.count || 0) + 1 : (prev[commentId]?.count || 0) - 1,
          loading: false
        }
      }));
    } catch (err: any) {
      console.error('Error toggling like:', err);
      setError(err.message || 'خطا در لایک کردن نظر. لطفاً دوباره تلاش کنید.');
      setLikeStates(prev => ({
        ...prev,
        [commentId]: { ...prev[commentId], loading: false }
      }));
    }
  };

  const handleToggleReplies = (commentId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleAdminAction = async (
    action: 'pin' | 'approve' | 'delete',
    commentId: string
  ) => {
    if (!isAdmin) return;

    try {
      switch (action) {
        case 'pin':
          await commentService.togglePin(commentId);
          break;
        case 'approve':
          await commentService.toggleApproval(commentId);
          break;
        case 'delete':
          if (window.confirm('آیا از حذف این نظر اطمینان دارید؟')) {
            await commentService.deleteComment(commentId);
          }
          break;
      }
      await loadComments();
    } catch (err) {
      console.error('Error performing admin action:', err);
      setError('خطا در انجام عملیات. لطفاً دوباره تلاش کنید.');
    }
  };

  const getAvatarUrl = (user: any) => {
    if (user?.profile_image_url) {
      return user.profile_image_url;
    }
    // اگر کاربر گوگل است و avatar_url در user_metadata وجود دارد
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return '/AE logo.svg';
  };

  // تابع مرتب‌سازی کامنت‌ها بر اساس پین و تایید
  const sortComments = (comments: Comment[]) => {
    return comments.slice().sort((a, b) => {
      // پین‌شده‌ها بالا
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // تاییدنشده‌ها پایین
      if (!a.is_approved && b.is_approved) return 1;
      if (a.is_approved && !b.is_approved) return -1;
      // بقیه بر اساس تاریخ
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // تابع کمکی برای گرفتن نام کاربر
  const getDisplayName = (user: any) => {
    if (user?.display_name && user.display_name.trim() !== '') return user.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'کاربر ناشناس';
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const likeState = likeStates[comment.id] || { liked: false, count: 0, loading: false };
    const isAdmin = user?.email === 'active.legendss@gmail.com';
    // تعیین کلاس حاشیه بر اساس وضعیت پین و تایید
    let borderClass = '';
    if (comment.is_pinned) borderClass = 'border-2 border-blue-500';
    else if (!comment.is_approved) borderClass = 'border-2 border-red-500';

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-white rounded-lg shadow-md p-4 mb-4 ${isReply ? 'ml-8' : ''} ${borderClass}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={getAvatarUrl(comment.user)}
              alt={comment.user?.display_name || 'کاربر'}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-800">{getDisplayName(comment.user)}</p>
              <p className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => handleAdminAction('pin', comment.id)}
                  className={`p-2 rounded-full ${comment.is_pinned ? 'text-blue-500' : 'text-gray-400'} hover:bg-gray-100`}
                  title={comment.is_pinned ? 'حذف پین' : 'پین کردن'}
                >
                  <FaThumbtack />
                </button>
                <button
                  onClick={() => handleAdminAction('approve', comment.id)}
                  className={`p-2 rounded-full ${comment.is_approved ? 'text-green-500' : 'text-gray-400'} hover:bg-gray-100`}
                  title={comment.is_approved ? 'لغو تایید' : 'تایید نظر'}
                >
                  {comment.is_approved ? <FaCheck /> : <FaTimes />}
                </button>
              </>
            )}
            {/* فقط اگر کاربر صاحب کامنت باشد یا ادمین باشد دکمه حذف نمایش داده شود */}
            {user && (user.id === comment.user_id || isAdmin) && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-red-500 hover:text-red-700"
              >
                حذف
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-gray-700">{comment.content}</p>
        {/* دکمه لایک و تعداد لایک با تراز مناسب */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => handleLike(comment.id)}
            disabled={!user || likeState.loading}
            className={`flex items-center gap-1 ${likeState.liked ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500`}
          >
            <FaThumbsUp />
            <span className="text-base font-medium">{likeState.count}</span>
          </button>
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-gray-400 hover:text-blue-500"
            >
              <FaReply />
            </button>
          )}
        </div>
        {replyingTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                ارسال پاسخ
              </button>
            </div>
          </form>
        </motion.div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {sortComments(comment.replies).map((reply) => renderComment(reply, true))}
        </div>
      )}
    </motion.div>
  );
};

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-2 text-gray-400">در حال بارگذاری نظرات...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6">نظرات</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}
      
      {session?.user?.id ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? 'پاسخ خود را بنویسید...' : 'نظر خود را بنویسید...'}
            className="w-full bg-gray-800 text-white rounded-lg p-4 mb-2 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
            minLength={5}
            maxLength={500}
            disabled={submitting}
          />
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">
              {newComment.length}/500 کاراکتر
            </span>
            <div className="flex gap-2">
              {replyingTo && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={submitting}
                >
                  انصراف
                </button>
              )}
              <button
                type="submit"
                disabled={!newComment.trim() || newComment.length < 5 || submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'در حال ارسال...' : 'ارسال نظر'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 text-gray-400 bg-gray-800/50 rounded-lg mb-8">
          برای ارسال نظر لطفاً وارد شوید.
        </div>
      )}

      <AnimatePresence>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            هنوز نظری ثبت نشده است. اولین نظر را شما ثبت کنید!
          </div>
        ) : (
          sortComments(comments).map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
            </div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}; 