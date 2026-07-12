import { loanCalculators } from './loans.js';
import { investmentCalculators } from './investments.js';
import { taxCalculators } from './taxes.js';
import { everydayCalculators } from './everyday.js';
import { advancedCalculators } from './advanced.js';
import { CalculatorDef } from '../types.js';

export const allCalculators: CalculatorDef[] = [
  ...loanCalculators,
  ...investmentCalculators,
  ...taxCalculators,
  ...everydayCalculators,
  ...advancedCalculators
];

export function getCalculatorBySlug(slug: string): CalculatorDef | undefined {
  return allCalculators.find(c => c.slug === slug);
}

export const categoriesMap = {
  loan: 'Loan Calculators',
  investment: 'Investment Calculators',
  tax: 'Tax & Salary',
  savings: 'Savings & Personal Finance',
  everyday: 'Everyday Calculators'
};
