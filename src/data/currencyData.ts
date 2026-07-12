export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
}

export const currencies: Currency[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸', locale: 'en-US' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', locale: 'en-IN' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', locale: 'de-DE' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', locale: 'ar-AE' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', locale: 'en-AU' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', locale: 'de-CH' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', locale: 'en-SG' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', locale: 'en-NZ' }
];
