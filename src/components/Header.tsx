import { useState, useEffect } from 'react';
import { Calculator, Search, Menu, X, ArrowRight, BookOpen } from 'lucide-react';
import { allCalculators } from '../calculators';
import { CalculatorDef } from '../types';
import { SearchOverlay } from './SearchOverlay';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export function Header({ currentPath, navigate }: HeaderProps) {
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Register keyboard shortcut CTRL+K to open search overlay
  useEffect(() => {
    const handleShortcut = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOverlayOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex cursor-pointer items-center gap-2.5 select-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Calculator className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Finance<span className="text-blue-600">Calc</span>
          </span>
        </div>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => navigate('/')} 
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPath === '/' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/blog')} 
            className={`text-sm font-semibold transition-colors cursor-pointer ${
              currentPath.startsWith('/blog') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Guides
          </button>
          <button 
            onClick={() => navigate('/#calculators')} 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Calculators
          </button>
          <button 
            onClick={() => navigate('/#categories')} 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Categories
          </button>
          <button 
            onClick={() => navigate('/about')} 
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPath === '/about' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            About
          </button>
          <button 
            onClick={() => navigate('/contact')} 
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPath === '/contact' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right side operations */}
        <div className="flex items-center gap-4">
          
          {/* Interactive Search input */}
          <div 
            onClick={() => setSearchOverlayOpen(true)}
            className="relative hidden sm:block cursor-pointer select-none"
          >
            <div className="relative">
              <div className="w-64 rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-9 pr-12 text-xs text-gray-400 flex items-center justify-between hover:border-gray-400 hover:bg-gray-100/50 transition-all duration-150">
                <span>Search calculators...</span>
                <kbd className="pointer-events-none absolute right-3 inline-flex h-5 select-none items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 font-mono text-[9px] font-medium text-gray-400 shadow-2xs">
                  <span>⌘</span>K
                </kbd>
              </div>
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={() => navigate('/#calculators')}
            className="hidden md:inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Explore Free
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          {/* Mobile search bar */}
          <button
            onClick={() => {
              setSearchOverlayOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-start rounded-lg border border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-400 hover:bg-gray-100/50 transition-colors cursor-pointer"
          >
            <Search className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
            <span>Search 26+ calculators...</span>
          </button>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigate('/blog');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50/50"
            >
              Guides
            </button>
            <button
              onClick={() => {
                navigate('/#calculators');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Calculators
            </button>
            <button
              onClick={() => {
                navigate('/#categories');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Categories
            </button>
            <button
              onClick={() => {
                navigate('/about');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              About
            </button>
            <button
              onClick={() => {
                navigate('/contact');
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Contact
            </button>
          </div>
        </div>
      )}

      {/* Command Palette Overlay */}
      <SearchOverlay 
        isOpen={searchOverlayOpen} 
        onClose={() => setSearchOverlayOpen(false)} 
        navigate={navigate} 
      />
    </header>
  );
}
