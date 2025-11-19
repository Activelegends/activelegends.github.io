import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GameCard } from '../components/GameCard';
import { AddGameModal } from '../components/AddGameModal';
import { Helmet } from 'react-helmet-async';

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

export { default as Contact } from './Contact';

export const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(session?.user?.email === 'active.legendss@gmail.com');
    };

    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('is_visible', true);

        if (error) throw error;
        setGames(data || []);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
    fetchGames();
  }, []);

  const handleAddGame = async (newGame: Omit<Game, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([newGame])
        .select()
        .single();

      if (error) throw error;
      setGames([...games, data]);
    } catch (error) {
      console.error('Error adding game:', error);
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

  return (
    <>
      <Helmet>
        <title>بازی‌ها | Active Legend - مجموعه بازی‌های ایرانی</title>
        <meta name="description" content="مجموعه کامل بازی‌های ایرانی و بین‌المللی در Active Legend. دانلود، بازی و تجربه بهترین بازی‌های موبایل و کامپیوتر." />
        <meta name="keywords" content="بازی, گیم, بازی ایرانی, بازی موبایل, بازی کامپیوتر, دانلود بازی, Active Legend, بازی آنلاین, بازی آفلاین" />
        <link rel="canonical" href="https://activelegend.ir/games" />
        <meta property="og:title" content="بازی‌ها | Active Legend" />
        <meta property="og:description" content="مجموعه کامل بازی‌های ایرانی و بین‌المللی در Active Legend" />
        <meta property="og:url" content="https://activelegend.ir/games" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="بازی‌ها | Active Legend" />
        <meta name="twitter:description" content="مجموعه کامل بازی‌های ایرانی و بین‌المللی در Active Legend" />
      </Helmet>
      <div className="min-h-screen bg-black pt-24">
        <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {isAdmin && (
          <>
            <button
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-8 left-8 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
              افزودن بازی جدید
            </button>

            <AddGameModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSave={handleAddGame}
            />
          </>
        )}
        </div>
      </div>
    </>
  );
}; 