import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ContentBlockProps {
  block: {
    type: 'image' | 'video' | 'text';
    src?: string;
    alt?: string;
    caption?: string;
    content?: string;
  };
  index: number;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({ block, index }) => {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingDown(currentScrollY > lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isEven = index % 2 === 0;
  const alignmentContainerClass = isEven
    ? 'w-full flex justify-end mb-8'
    : 'w-full flex justify-start mb-8';

  const getMotionProps = () => {
    return {
      initial: { opacity: 0, y: isScrollingDown ? 50 : -50 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: false, amount: 0.3, margin: "100px" },
      transition: { 
        duration: 0.7,
        ease: "easeOut"
      }
    };
  };

  const renderContent = () => {
    if (block.type === 'image') {
      return (
        <img
          src={block.src}
          alt={block.alt || block.caption || 'تصویر مرتبط با محتوا'}
          className="w-full md:w-3/4 rounded-2xl shadow-xl object-cover"
        />
      );
    }

    if (block.type === 'video') {
      return (
        <div className="w-full md:w-3/4 rounded-2xl overflow-hidden shadow-xl">
          <iframe
            src={block.src}
            title={block.caption || 'ویدیو بازی'}
            className="w-full h-64 md:h-96"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      );
    }

    if (block.type === 'text') {
      return (
        <div className="w-full bg-gray-900 text-gray-100 p-6 rounded-2xl">
          <p className="text-lg leading-relaxed font-medium">{block.content}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      ref={ref}
      {...getMotionProps()}
      className={block.type === 'text' ? 'w-full mb-8' : alignmentContainerClass}
    >
      {renderContent()}
    </motion.div>
  );
}; 