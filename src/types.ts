export type CalculatorCategory = 'loan' | 'investment' | 'tax' | 'savings' | 'everyday';

export interface CalculatorInput {
  id: string;
  name: string;
  type: 'number' | 'slider' | 'select' | 'toggle' | 'date';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
  unit?: string;
  prefix?: string;
  options?: { label: string; value: any }[];
}

export interface AmortizationRow {
  period: number; // Month or Year number
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface GrowthRow {
  year: number;
  invested: number;
  interest: number;
  total: number;
}

export interface TaxBracketRow {
  rate: number;
  range: string;
  taxableIncome: number;
  taxAmount: number;
}

export interface CalculatorResult {
  summary: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  charts?: {
    pie?: { label: string; value: number; color: string }[];
    growth?: GrowthRow[];
    amortization?: AmortizationRow[];
    brackets?: TaxBracketRow[];
    budget?: { label: string; amount: number; pct: number; color: string; status: string }[];
    debt?: { method: string; months: number; totalInterest: number; schedule: { month: number; balance: number }[] }[];
  };
  detailsTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CalculatorDef {
  id: string;
  name: string;
  slug: string;
  category: CalculatorCategory;
  description: string;
  longDescription: string;
  inputs: CalculatorInput[];
  calculate: (inputs: Record<string, any>) => CalculatorResult;
  formula: string;
  formulaExplanation: string;
  example: {
    scenario: string;
    steps: string[];
    result: string;
  };
  faqs: FAQItem[];
  seoTitle: string;
  seoDescription: string;
}
