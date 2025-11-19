import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { GameCard } from '../components/GameCard';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';

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

export const MyGames: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavoriteGames = async () => {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: favorites, error: favoritesError } = await supabase
          .from('favorites')
          .select('game_id')
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        if (favorites && favorites.length > 0) {
          const gameIds = favorites.map(f => f.game_id);
          const { data: gamesData, error: gamesError } = await supabase
            .from('games')
            .select('*')
            .in('id', gameIds)
            .eq('is_visible', true);

          if (gamesError) throw gamesError;
          setGames(gamesData || []);
        }
      } catch (error) {
        console.error('Error fetching favorite games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteGames();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>بازی‌های من | Active Legend - مجموعه شخصی بازی‌ها</title>
        <meta name="description" content="مجموعه شخصی بازی‌های مورد علاقه شما در Active Legend. مدیریت و دسترسی آسان به بازی‌های محبوبتان." />
        <meta name="keywords" content="بازی‌های من, علاقه‌مندی‌ها, مجموعه شخصی, Active Legend, بازی‌های محبوب" />
        <link rel="canonical" href="https://activelegend.ir/my-games" />
        <meta property="og:title" content="بازی‌های من | Active Legend" />
        <meta property="og:description" content="مجموعه شخصی بازی‌های مورد علاقه شما در Active Legend" />
        <meta property="og:url" content="https://activelegend.ir/my-games" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="بازی‌های من | Active Legend" />
        <meta name="twitter:description" content="مجموعه شخصی بازی‌های مورد علاقه شما در Active Legend" />
      </Helmet>
      <div className="min-h-screen bg-black p-4 md:p-8 pt-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-8 text-center"
      >
        🎮 بازی‌های من
      </motion.h1>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 text-lg"
        >
          بازی مورد علاقه‌ای اضافه نشده است.
        </motion.p>
      )}
      </div>
    </>
  );
}; 