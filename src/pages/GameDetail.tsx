import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { ContentBlock } from '../components/ContentBlock';
import { EditGameModal } from '../components/EditGameModal';
import { FavoriteButton } from '../components/FavoriteButton';
import { useAuth } from '../contexts/AuthContext';
import { Comments } from '../components/Comments';

interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_icon: string;
  download_url: string;
  status: 'in_progress' | 'released' | 'coming_soon';
  is_visible: boolean;
  content_blocks: Array<{
    type: 'image' | 'video' | 'text';
    src?: string;
    alt?: string;
    caption?: string;
    content?: string;
  }>;
}

export const GameDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(session?.user?.email === 'active.legendss@gmail.com');
    };

    const fetchGame = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (!data || !data.is_visible) {
          navigate('/404');
          return;
        }

        setGame(data);
      } catch (error) {
        console.error('Error fetching game:', error);
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
    fetchGame();
  }, [slug, navigate]);

  const handleUpdateGame = async (updatedGame: Game) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .update(updatedGame)
        .eq('id', game?.id)
        .select()
        .single();

      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">بازی یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-4">{game.title}</h1>
          <p className="text-base font-medium text-gray-300 mb-6">{game.description}</p>
          <div className="flex items-center gap-4">
            <a
              href={game.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#F4B744] text-black font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-200"
            >
              دانلود بازی
            </a>
            {user && game && (
              <FavoriteButton gameId={game.id} />
            )}
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-200"
              >
                ویرایش بازی
              </button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {game.content_blocks.map((block, index) => (
            <ContentBlock key={index} block={block} index={index} />
          ))}
        </div>

        {isAdmin && (
          <EditGameModal
            game={game}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateGame}
          />
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Comments gameId={game.id} />
          </div>
        </div>
      </div>
    </div>
  );
}; 