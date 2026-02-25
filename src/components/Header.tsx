import React from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../hooks/useAuth'; // فرضی

export const Header = () => {
  const { user, isLoading } = useAuth(); // وضعیت کاربر

  const navItems = [
    { to: '/', label: 'خانه' },
    { to: '/videos', label: 'ویدیوها' },
    { to: '/gallery', label: 'ویترین' },
    { to: '/about', label: 'درباره ما' },
    { to: '/contact', label: 'تماس با ما' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* لوگو و منو */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" aria-label="صفحه اصلی">
              <img
                src="/AE logo.svg"
                alt="اکتیو لجند"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <nav className="mr-6 hidden md:flex space-x-4 rtl:space-x-reverse" aria-label="منوی اصلی">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* بخش کاربر */}
          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {user ? (
                  <UserAvatar size="medium" className="hover:opacity-80 transition-opacity" />
                ) : (
                  <>
                    <Link to="/login" className="btn-outline">ورود</Link>
                    <Link to="/register" className="btn-primary">ثبت‌نام</Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};