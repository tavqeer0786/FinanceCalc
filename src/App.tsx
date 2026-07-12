import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection, FeatureSection, PopularCalculators, CategoriesSection } from './components/HomeSections';
import { AboutPage, ContactPage, PrivacyPolicyPage, TermsOfServicePage, CookieSettingsPage } from './components/StaticPages';
import { getCalculatorBySlug } from './calculators';
import { CalculatorLayout } from './components/CalculatorLayout';
import { BlogLayout } from './components/BlogLayout';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync state with popstate browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom SPA navigator to keep page transitions smooth
  const navigate = (path: string) => {
    // Scroll handling for anchor hashes
    if (path.startsWith('/#')) {
      const hash = path.substring(2);
      if (currentPath === '/') {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } else {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return;
      }
    }
    
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract the slug (e.g. "/emi-calculator" -> "emi-calculator")
  const slug = currentPath.substring(1);
  const selectedCalc = getCalculatorBySlug(slug);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-blue-800">
      
      {/* Sticky Header Nav */}
      <Header currentPath={currentPath} navigate={navigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPath === '/' ? (
          <div className="space-y-4">
            <HeroSection navigate={navigate} />
            <FeatureSection />
            <PopularCalculators navigate={navigate} />
            <CategoriesSection navigate={navigate} />
          </div>
        ) : currentPath === '/about' ? (
          <AboutPage navigate={navigate} />
        ) : currentPath === '/contact' ? (
          <ContactPage />
        ) : currentPath === '/privacy-policy' ? (
          <PrivacyPolicyPage />
        ) : currentPath === '/terms-of-service' ? (
          <TermsOfServicePage />
        ) : currentPath === '/cookie-settings' ? (
          <CookieSettingsPage />
        ) : (currentPath === '/blog' || currentPath.startsWith('/blog/')) ? (
          <BlogLayout currentPath={currentPath} navigate={navigate} />
        ) : selectedCalc ? (
          <CalculatorLayout calc={selectedCalc} navigate={navigate} />
        ) : (
          /* Fallback 404 */
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center space-y-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Page Not Found</h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              We couldn't find the requested calculator tool slug. Try searching in the navigation search bar or exploring our categories.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Go Back Home
            </button>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <Footer navigate={navigate} />
    </div>
  );
}
