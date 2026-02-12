
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieConsent from './components/features/CookieConsent';
import SubscriptionAlert from './components/features/SubscriptionAlert';
import ChatWidget from './components/features/ChatWidget';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { Loader2 } from 'lucide-react';
import Home from './pages/Home';

// Lazy load pages
const ArticleView = lazy(() => import('./pages/ArticleView'));
const Author = lazy(() => import('./pages/Author'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Educadicas = lazy(() => import('./pages/Educadicas'));
const Resources = lazy(() => import('./pages/Resources'));
const QuizPage = lazy(() => import('./pages/Quiz'));
const Favorites = lazy(() => import('./pages/Favorites'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const AIResearch = lazy(() => import('./pages/AIResearch'));
const Admin = lazy(() => import('./pages/Admin'));
const RSSFeed = lazy(() => import('./pages/RSSFeed.tsx'));

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sussurros_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sussurros_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-brand-light dark:bg-slate-950 font-sans transition-colors duration-300">
        <Routes>
          <Route path="/admin" element={
            <Suspense fallback={<PageLoader />}>
              <Admin />
            </Suspense>
          } />

          <Route path="*" element={
            <>
              <Navbar theme={theme} onToggleTheme={toggleTheme} />
              <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/article/:id" element={<ArticleView />} />
                    <Route path="/author/:name" element={<Author />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/educadicas" element={<Educadicas />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/lab" element={<AIResearch />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/rss" element={<RSSFeed />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfUse />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <CookieConsent />
              <SubscriptionAlert />
              <ChatWidget />
              <ScrollToTopButton />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
