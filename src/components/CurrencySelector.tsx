import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { currencies } from '../data/currencyData';

export function CurrencySelector() {
  const { currentCurrency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-y-0 left-0 flex items-center z-20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-full items-center gap-1 rounded-l-lg border-r border-gray-200 bg-gray-50 px-2.5 text-[11px] font-bold text-gray-500 hover:bg-gray-150 hover:text-gray-800 focus:outline-none transition-colors select-none cursor-pointer"
      >
        <span className="text-sm shrink-0">{currentCurrency.flag}</span>
        <span className="shrink-0">{currentCurrency.code}</span>
        <span className="text-[7px] text-gray-400 shrink-0">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 max-h-60 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg focus:outline-none scrollbar-thin">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              type="button"
              onClick={() => {
                setCurrency(currency.code);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs hover:bg-gray-50 transition-colors cursor-pointer ${
                currentCurrency.code === currency.code ? 'bg-blue-50/60 font-bold text-blue-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-sm shrink-0">{currency.flag}</span>
                <span className="font-semibold shrink-0">{currency.code}</span>
                <span className="text-gray-300 shrink-0">—</span>
                <span className="truncate text-gray-500">{currency.name}</span>
              </div>
              <span className="text-gray-400 font-semibold shrink-0 ml-1">({currency.symbol})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
