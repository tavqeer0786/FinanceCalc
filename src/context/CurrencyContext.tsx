import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencies, Currency } from '../data/currencyData';
import { formatCurrency } from '../utils/formatCurrency';

interface CurrencyContextType {
  currentCurrency: Currency;
  setCurrency: (code: string) => void;
  format: (value: number, includeSymbol?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrencyState] = useState<Currency>(currencies[0]);

  // Read initial currency from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('financecalc_currency');
      if (saved) {
        const found = currencies.find(c => c.code === saved);
        if (found) {
          setCurrentCurrencyState(found);
        }
      }
    } catch (e) {
      console.error('Failed to read currency from localStorage', e);
    }
  }, []);

  const setCurrency = (code: string) => {
    const found = currencies.find(c => c.code === code);
    if (found) {
      setCurrentCurrencyState(found);
      try {
        localStorage.setItem('financecalc_currency', code);
      } catch (e) {
        console.error('Failed to save currency to localStorage', e);
      }
    }
  };

  const format = (value: number, includeSymbol = true) => {
    return formatCurrency(value, currentCurrency, includeSymbol);
  };

  return (
    <CurrencyContext.Provider value={{ currentCurrency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
