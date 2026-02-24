import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AnimatedBackground from './components/AnimatedBackground';
import MediaShowcase from './components/MediaShowcase';
import { Games } from './pages/Games';
import { GameDetail } from './pages/GameDetail';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { useEffect, useState } from 'react';
import { MyGames } from './pages/MyGames';
import TermsAndConditionsPage from './pages/TermsAndConditions';
import TermsManagement from './pages/admin/TermsManagement';
import './styles/admin.css';
import { Footer } from './components/Footer';
import DownloadPage from './pages/Download';
import DownloadLinksAdmin from './pages/admin/DownloadLinksAdmin';
import { Contact } from './pages/Games';
import About from './pages/About';
import TeamAdmin from './pages/TeamAdmin';
import GameEngine from './pages/GameEngine';
import { HelmetProvider } from 'react-helmet-async';
import BlogPage from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import BlogAdminPage from './pages/admin/BlogAdmin';
import BlogCommentsAdminPage from './pages/admin/BlogCommentsAdmin';
import DefaultAvatarsAdminPage from './pages/admin/DefaultAvatarsAdmin';
import YektanetAdminPage from './pages/admin/YektanetAdmin';
import ProfilePage from './pages/Profile';
import CommentsAdminPage from './pages/admin/CommentsAdmin';
import UsersAdminPage from './pages/admin/UsersAdmin';
import AuthCallbackPage from './pages/auth/callback';

function App() {
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    // Disable scroll chaining on mobile
    //document.body.style.overscrollBehavior = 'none';
    
    // Add passive scroll listener for better performance
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const bodyHeight = document.body.scrollHeight;
      // Show footer if user is at (or very near) the bottom
      setShowFooter(scrollY + windowHeight >= bodyHeight - 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case already at bottom
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <HelmetProvider>
    <Router>
      <AuthProvider>
        <ProfileProvider>
        <div className="min-h-screen relative scroll-container">
          <AnimatedBackground />
          <div className="relative z-20">
            <Navbar />
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <MediaShowcase />
                </>
              } />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:slug" element={<GameDetail />} />
              <Route path="/my-games" element={<MyGames />} />
                <Route path="/terms" element={<TermsAndConditionsPage />} />
                <Route path="/admin/terms" element={<TermsManagement />} />
                <Route path="/admin/download-links" element={<DownloadLinksAdmin />} />
                <Route path="/download/:id" element={<DownloadPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/game" element={<GameEngine />} />
                <Route path="/team-admin" element={<TeamAdmin />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/admin/blog" element={<BlogAdminPage />} />
                <Route path="/admin/blog-comments" element={<BlogCommentsAdminPage />} />
                <Route path="/admin/default-avatars" element={<DefaultAvatarsAdminPage />} />
                <Route path="/admin/yektanet" element={<YektanetAdminPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/users" element={<UsersAdminPage />} />
                <Route path="/admin/comments" element={<CommentsAdminPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
            {showFooter && (
              <div className="fixed bottom-0 left-0 w-full z-50">
                <Footer />
              </div>
            )}
        </div>
        </ProfileProvider>
      </AuthProvider>
    </Router>
    </HelmetProvider>
  );
}

export default App;