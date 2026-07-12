import { loanCalculators } from './loans';
import { investmentCalculators } from './investments';
import { taxCalculators } from './taxes';
import { everydayCalculators } from './everyday';
import { advancedCalculators } from './advanced';
import { CalculatorDef } from '../types';

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
