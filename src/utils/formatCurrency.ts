import { Currency } from '../data/currencyData';

/**
 * Utility to format numbers into localized currency format using Intl.NumberFormat
 */
export function formatCurrency(
  value: number,
  currency: Currency,
  includeSymbol: boolean = true
): string {
  const sanitizedValue = isNaN(value) || !isFinite(value) ? 0 : value;

  return new Intl.NumberFormat(currency.locale, {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: currency.code,
    minimumFractionDigits: sanitizedValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(sanitizedValue);
}
