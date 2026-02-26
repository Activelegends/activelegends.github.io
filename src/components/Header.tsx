import React from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo-link">
            <img src="/AE logo.svg" alt="Active Legend Logo" className="logo" />
          </Link>
          <ul className="nav-links">
            <li><Link to="/">خانه</Link></li>
            <li><Link to="/videos">ویدیوها</Link></li>
            <li><Link to="/gallery">ویترین</Link></li>
            <li><Link to="/about">درباره ما</Link></li>
            <li><Link to="/contact">تماس با ما</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and navigation */}
          <div className="flex items-center">
            {/* ... existing logo and nav code ... */}
          </div>

          {/* User section */}
          <div className="flex items-center gap-4">
            <UserAvatar size="medium" className="hover:opacity-80 transition-opacity" />
            {/* ... existing auth buttons ... */}
          </div>
        </div>
      </div>
    </header>
  );
} 