import React from 'react';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer
      dir="rtl"
      className="bg-black/60 backdrop-blur-sm border-t border-white/10 min-h-[32px] py-1 flex items-center justify-center"
    >
      <p className="text-xs text-center text-gray-200 leading-tight m-0">
        &copy; {currentYear} تمامی حقوق این وب‌سایت متعلق به{' '}
        <span className="font-bold text-white">محمد مهدی مولایاری</span> است.
      </p>
    </footer>
  );
};