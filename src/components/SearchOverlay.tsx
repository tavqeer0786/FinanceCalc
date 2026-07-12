import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, X, Calculator, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { allCalculators } from '../calculators';
import { CalculatorDef } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export function SearchOverlay({ isOpen, onClose, navigate }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CalculatorDef[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fc_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, [isOpen]);

  // Handle ESC key and focus on input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle calculator searching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setActiveIndex(-1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches = allCalculators.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );

    setSearchResults(matches.slice(0, 8));
    setActiveIndex(0); // auto-focus first item
  }, [searchQuery]);

  const handleSelectCalculator = (slug: string, name: string) => {
    // Add to recent searches
    const updated = [name, ...recentSearches.filter((item) => item !== name)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('fc_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSearchQuery('');
    onClose();
    navigate(`/${slug}`);
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('fc_recent_searches');
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const listLength = searchResults.length;
    if (listLength === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + listLength) % listLength);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < listLength) {
        const selected = searchResults[activeIndex];
        handleSelectCalculator(selected.slug, selected.name);
      }
    }
  };

  if (!isOpen) return null;

  const popularCalculators = allCalculators.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Container */}
      <div 
        ref={overlayRef}
        className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl transition-all flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search calculators (e.g. mortgage, SIP, tax)..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {searchResults.length > 0 ? (
            // Search Results List
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2">
                Matching Calculators
              </span>
              <div className="space-y-1">
                {searchResults.map((calc, idx) => (
                  <button
                    key={calc.id}
                    onClick={() => handleSelectCalculator(calc.slug, calc.name)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-3 text-left transition-colors cursor-pointer ${
                      activeIndex === idx 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 scale-[1.01]' 
                        : 'hover:bg-slate-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeIndex === idx ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-semibold ${activeIndex === idx ? 'text-white' : 'text-gray-900'}`}>
                          {calc.name}
                        </span>
                        <span className={`text-[10px] ${activeIndex === idx ? 'text-blue-100' : 'text-gray-400'} line-clamp-1`}>
                          {calc.description}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className={`h-3.5 w-3.5 ${activeIndex === idx ? 'text-white' : 'text-gray-400'}`} />
                  </button>
                ))}
              </div>
            </div>
          ) : searchQuery.trim() ? (
            // No results found screen
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-gray-900">No calculators found</p>
              <p className="text-xs text-gray-400 mt-1">We couldn't find any results for "{searchQuery}"</p>
            </div>
          ) : (
            // Default View (Recents and Populars)
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </span>
                    <button 
                      onClick={handleClearRecents}
                      className="text-[10px] font-medium text-gray-400 hover:text-blue-600 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setSearchQuery(item);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Calculators */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Popular Calculators
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularCalculators.map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => handleSelectCalculator(calc.slug, calc.name)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-150 text-left hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {calc.name}
                        </span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{calc.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info and Hotkeys info */}
        <div className="bg-slate-50 border-t border-slate-100 py-2.5 px-4 flex items-center justify-between text-[10px] text-gray-400 select-none shrink-0">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-white font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded border border-gray-200 bg-white font-mono">Enter</kbd> Select</span>
          </div>
          <span>Esc to Close</span>
        </div>
      </div>
    </div>
  );
}
