/**
 * Formatting and data export utilities for FinanceCalc
 */

// Centralized number & currency formatting
export const formatCurrency = (value: number, locale = 'en-US', currency = 'USD'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatYears = (value: number): string => {
  return `${value} ${value === 1 ? 'Year' : 'Years'}`;
};

// CSV Export Engine
export const exportToCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
  if (!rows || rows.length === 0) return;

  const content = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.map(val => {
        const strVal = String(val);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Advanced Print / PDF Trigger
export const triggerPrintReport = (calcName: string) => {
  window.print();
};
