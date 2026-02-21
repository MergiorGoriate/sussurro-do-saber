
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { ErrorBoundary, withProfiler } from "@sentry/react";
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieConsent from './components/features/CookieConsent';
import SubscriptionAlert from './components/features/SubscriptionAlert';
import ChatWidget from './components/features/ChatWidget';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { Loader2 } from 'lucide-react';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

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
const RSSFeed = lazy(() => import('./pages/RSSFeed.tsx'));
const Library = lazy(() => import('./pages/Library'));
const PublicationDetail = lazy(() => import('./pages/PublicationDetail'));
const AuthorsGuideline = lazy(() => import('./pages/guidelines/Authors'));
const ReviewersGuideline = lazy(() => import('./pages/guidelines/Reviewers'));
const EditorsGuideline = lazy(() => import('./pages/guidelines/Editors'));
const LibrariansGuideline = lazy(() => import('./pages/guidelines/Librarians'));

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

const AdminRedirect = () => {
  useEffect(() => {
    window.location.href = 'http://127.0.0.1:8000/admin/';
  }, []);
  return <PageLoader />;
};

const AuthCallback = lazy(() => import('./pages/AuthCallback'));

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
    <ErrorBoundary fallback={<div className="p-8 text-center"><h2 className="text-xl font-bold">Algo correu mal.</h2><p className="text-slate-500">O erro foi reportado e será resolvido brevemente.</p></div>}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-center" richColors />
          <div className="flex flex-col min-h-screen bg-brand-light dark:bg-slate-950 font-sans transition-colors duration-300">
            <Routes>
              <Route path="/admin" element={<AdminRedirect />} />

              {/* Auth Callbacks - Clean layout */}
              <Route path="/auth/callback/google" element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />
              <Route path="/auth/callback/apple" element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />

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
                        <Route path="/biblioteca" element={<Library />} />
                        <Route path="/biblioteca/:slug" element={<PublicationDetail />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/lab" element={<AIResearch />} />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/rss" element={<RSSFeed />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfUse />} />
                        <Route path="/guidelines/authors" element={<AuthorsGuideline />} />
                        <Route path="/guidelines/critics" element={<ReviewersGuideline />} />
                        <Route path="/guidelines/editors" element={<EditorsGuideline />} />
                        <Route path="/guidelines/librarians" element={<LibrariansGuideline />} />
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
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default withProfiler(App);
