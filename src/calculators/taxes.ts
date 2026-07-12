import { CalculatorDef, TaxBracketRow } from '../types';

export const taxCalculators: CalculatorDef[] = [
  {
    id: 'income-tax',
    name: 'Income Tax Calculator',
    slug: 'income-tax-calculator',
    category: 'tax',
    description: 'Estimate progressive income tax liabilities, standard deductions, and effective tax rates.',
    longDescription: 'Understand your tax obligations. This calculator processes standard progressive tax brackets and deductions, showing exactly how each dollar is taxed.',
    inputs: [
      { id: 'income', name: 'Annual Gross Income', type: 'number', min: 1000, max: 10000000, step: 1000, defaultValue: 85000, prefix: '$' },
      { id: 'deductions', name: 'Pre-Tax Deductions (401k/HSA)', type: 'number', min: 0, max: 100000, step: 500, defaultValue: 6500, prefix: '$' },
      { id: 'standardDeduction', name: 'Standard Filing Deduction', type: 'select', options: [{ label: 'Single ($14,600)', value: 14600 }, { label: 'Married Joint ($29,200)', value: 29200 }, { label: 'Head of Household ($21,900)', value: 21900 }], defaultValue: 14600 }
    ],
    calculate: (inputs) => {
      const gross = Number(inputs.income);
      const preTaxDed = Number(inputs.deductions);
      const standardDed = Number(inputs.standardDeduction);
      
      const totalDed = preTaxDed + standardDed;
      const taxableIncome = Math.max(0, gross - totalDed);
      
      // Standard progressive tax brackets
      const brackets = [
        { limit: 11600, rate: 0.10 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ];
      
      let taxAmount = 0;
      let remainingIncome = taxableIncome;
      let prevLimit = 0;
      
      const bracketRows: TaxBracketRow[] = [];
      
      for (const b of brackets) {
        const span = b.limit - prevLimit;
        const taxableInBracket = Math.min(remainingIncome, span);
        
        if (taxableInBracket > 0) {
          const taxInBracket = taxableInBracket * b.rate;
          taxAmount += taxInBracket;
          
          bracketRows.push({
            rate: b.rate * 100,
            range: `$${prevLimit.toLocaleString()} - ${b.limit === Infinity ? 'Over' : '$' + b.limit.toLocaleString()}`,
            taxableIncome: taxableInBracket,
            taxAmount: taxInBracket
          });
          
          remainingIncome -= taxableInBracket;
        } else {
          bracketRows.push({
            rate: b.rate * 100,
            range: `$${prevLimit.toLocaleString()} - ${b.limit === Infinity ? 'Over' : '$' + b.limit.toLocaleString()}`,
            taxableIncome: 0,
            taxAmount: 0
          });
        }
        
        prevLimit = b.limit;
        if (remainingIncome <= 0) break;
      }
      
      const takeHome = gross - taxAmount - preTaxDed;
      const effectiveRate = gross > 0 ? (taxAmount / gross) * 100 : 0;
      
      return {
        summary: [
          { label: 'Estimated Annual Tax', value: `$${taxAmount.toFixed(2)}`, color: '#EF4444' },
          { label: 'Taxable Income', value: `$${taxableIncome.toLocaleString()}` },
          { label: 'Net Take-Home Salary', value: `$${takeHome.toFixed(2)}`, color: '#16A34A' },
          { label: 'Effective Tax Rate', value: `${effectiveRate.toFixed(2)}%`, color: '#2563EB' }
        ],
        charts: {
          pie: [
            { label: 'Take-Home Net', value: takeHome, color: '#16A34A' },
            { label: 'Federal Income Tax', value: taxAmount, color: '#EF4444' },
            { label: 'Total Deductions', value: totalDed, color: '#2563EB' }
          ],
          brackets: bracketRows
        }
      };
    },
    formula: 'Taxable Income = Gross Income - Deductions - Standard Filing Deduction; Progressive Brackets then applied recursively.',
    formulaExplanation: 'Income tax is progressive. You only pay higher rates on the portion of income that crosses into those higher thresholds, not your entire gross income.',
    example: {
      scenario: 'Calculating tax on a single person earning $90,000 gross with a $5,000 pre-tax 401(k) contribution.',
      steps: [
        'Gross Income = $90,000',
        'Total Deductions = $5,000 (401k) + $14,600 (Standard) = $19,600',
        'Taxable Income = $90,000 - $19,600 = $70,400',
        'Bracket 1: 10% of first $11,600 = $1,160',
        'Bracket 2: 12% of next $35,550 = $4,266',
        'Bracket 3: 22% of remaining $23,250 = $5,115',
        'Total Tax = $1,160 + $4,266 + $5,115 = $10,541'
      ],
      result: 'The total income tax is $10,541. Effective tax rate is 11.71%. Net take-home is $74,459.'
    },
    faqs: [
      { question: 'What is standard vs itemized deduction?', answer: 'Standard deduction is a fixed amount the government allows to reduce tax liabilities. Itemizing means adding up individual deductions like mortgage interest and charity.' },
      { question: 'What is the marginal tax rate?', answer: 'The marginal tax rate is the tax rate applied to the last dollar you earn. The effective tax rate is the actual overall percentage paid.' }
    ],
    seoTitle: 'Income Tax Calculator - Progressive Tax Brackets | FinanceCalc',
    seoDescription: 'Estimate federal income taxes, net take-home salary, and effective tax rates with our modern progressive bracket calculator.'
  },
  {
    id: 'gst',
    name: 'GST Calculator',
    slug: 'gst-calculator',
    category: 'tax',
    description: 'Calculate inclusive or exclusive Goods and Services Tax (GST) easily.',
    longDescription: 'Ensure billing and invoicing accuracy. Calculate net, tax, and gross transactions instantly for standard multi-tier GST rates.',
    inputs: [
      { id: 'amount', name: 'Transaction Amount', type: 'number', min: 1, max: 10000000, step: 100, defaultValue: 1500, prefix: '$' },
      { id: 'rate', name: 'GST Rate (%)', type: 'slider', min: 1, max: 35, step: 1, defaultValue: 18, unit: '%' },
      { id: 'type', name: 'Calculation Mode', type: 'select', options: [{ label: 'GST Exclusive (Add GST)', value: 1 }, { label: 'GST Inclusive (Remove GST)', value: 2 }], defaultValue: 1 }
    ],
    calculate: (inputs) => {
      const amt = Number(inputs.amount);
      const r = Number(inputs.rate);
      const type = Number(inputs.type);
      
      let gstAmount = 0;
      let netPrice = 0;
      let grossPrice = 0;
      
      if (type === 1) {
        // GST Exclusive
        gstAmount = (amt * r) / 100;
        netPrice = amt;
        grossPrice = amt + gstAmount;
      } else {
        // GST Inclusive
        gstAmount = amt - (amt * (100 / (100 + r)));
        netPrice = amt - gstAmount;
        grossPrice = amt;
      }
      
      return {
        summary: [
          { label: 'GST Tax Amount', value: `$${gstAmount.toFixed(2)}`, color: '#D97706' },
          { label: 'Net Value (Tax Free)', value: `$${netPrice.toFixed(2)}`, color: '#2563EB' },
          { label: 'Gross Value (Total Cost)', value: `$${grossPrice.toFixed(2)}`, color: '#16A34A' }
        ],
        charts: {
          pie: [
            { label: 'Net Product Cost', value: netPrice, color: '#2563EB' },
            { label: 'GST Component', value: gstAmount, color: '#D97706' }
          ]
        }
      };
    },
    formula: 'GST Exclusive: GST = Net x Rate / 100; GST Inclusive: GST = Gross - [Gross x (100 / (100+Rate))]',
    formulaExplanation: 'Exclusive calculation adds a new layer of taxes onto the base product price. Inclusive back-calculates how much tax is baked inside.',
    example: {
      scenario: 'Buying a laptop worth $1,000 under a standard 18% GST tax bracket.',
      steps: [
        'Exclusive: Base $1,000 + GST ($180) = Total $1,180',
        'Inclusive: Total $1,000 has GST embedded = 1,000 x (18/118) = $152.54, Net Price = $847.46'
      ],
      result: 'Exclusive adds $180 tax. Inclusive extracts $152.54 tax from your $1,000 total.'
    },
    faqs: [
      { question: 'What is the difference between GST inclusive and exclusive?', answer: 'Inclusive means the sticker price already contains the GST tax. Exclusive means taxes will be computed and added on top at checkout.' },
      { question: 'How is GST divided between state and federal?', answer: 'In dual-GST nations like India, GST is split 50/50 between Central GST (CGST) and State GST (SGST).' }
    ],
    seoTitle: 'Goods and Services Tax (GST) Calculator | FinanceCalc',
    seoDescription: 'Extract or add GST to invoices instantly. Use our interactive GST exclusive & inclusive calculator to streamline your bills.'
  },
  {
    id: 'salary',
    name: 'Salary & Paystub Calculator',
    slug: 'salary-calculator',
    category: 'tax',
    description: 'Calculate gross to net pay breakdowns across monthly and weekly payrolls.',
    longDescription: 'Decode your wage paystub. Input annual gross wage, retirement contributions, and health plans to see net liquid salary.',
    inputs: [
      { id: 'gross', name: 'Annual Gross Salary', type: 'number', min: 1000, max: 2000000, step: 1000, defaultValue: 75000, prefix: '$' },
      { id: 'retirement', name: 'Retirement Savings (401k/EPF %)', type: 'slider', min: 0, max: 30, step: 1, defaultValue: 6, unit: '%' },
      { id: 'taxes', name: 'Estimated Combined Taxes (%)', type: 'slider', min: 5, max: 50, step: 1, defaultValue: 22, unit: '%' },
      { id: 'insurance', name: 'Monthly Health Insurance Premium', type: 'number', min: 0, max: 2000, step: 50, defaultValue: 250, prefix: '$' }
    ],
    calculate: (inputs) => {
      const grossAnnual = Number(inputs.gross);
      const retPct = Number(inputs.retirement);
      const taxPct = Number(inputs.taxes);
      const insuranceMonthly = Number(inputs.insurance);
      
      const retirementAnnual = grossAnnual * (retPct / 100);
      const taxAnnual = (grossAnnual - retirementAnnual) * (taxPct / 100);
      const insuranceAnnual = insuranceMonthly * 12;
      
      const netAnnual = grossAnnual - retirementAnnual - taxAnnual - insuranceAnnual;
      
      return {
        summary: [
          { label: 'Monthly Net Take-Home', value: `$${(netAnnual / 12).toFixed(2)}`, color: '#16A34A' },
          { label: 'Weekly Net Take-Home', value: `$${(netAnnual / 52).toFixed(2)}`, color: '#2563EB' },
          { label: 'Annual Net Take-Home', value: `$${netAnnual.toFixed(2)}`, color: '#1D4ED8' }
        ],
        detailsTable: {
          headers: ['Pay Period', 'Gross Earnings', 'Retirement Savings', 'Estimated Taxes', 'Insurance Premium', 'Net Paystub'],
          rows: [
            ['Weekly', `$${(grossAnnual / 52).toFixed(2)}`, `$${(retirementAnnual / 52).toFixed(2)}`, `$${(taxAnnual / 52).toFixed(2)}`, `$${(insuranceAnnual / 52).toFixed(2)}`, `$${(netAnnual / 52).toFixed(2)}`],
            ['Bi-Weekly', `$${(grossAnnual / 26).toFixed(2)}`, `$${(retirementAnnual / 26).toFixed(2)}`, `$${(taxAnnual / 26).toFixed(2)}`, `$${(insuranceAnnual / 26).toFixed(2)}`, `$${(netAnnual / 26).toFixed(2)}`],
            ['Monthly', `$${(grossAnnual / 12).toFixed(2)}`, `$${(retirementAnnual / 12).toFixed(2)}`, `$${(taxAnnual / 12).toFixed(2)}`, `$${(insuranceAnnual / 12).toFixed(2)}`, `$${(netAnnual / 12).toFixed(2)}`],
            ['Annually', `$${grossAnnual.toLocaleString()}`, `$${retirementAnnual.toLocaleString()}`, `$${taxAnnual.toLocaleString()}`, `$${insuranceAnnual.toLocaleString()}`, `$${netAnnual.toLocaleString()}`]
          ]
        }
      };
    },
    formula: 'Net Pay = Gross Pay - (Gross x Retirement%) - Taxes - Insurance Contributions.',
    formulaExplanation: 'Retirement plans are pre-tax, meaning they lower your taxable income before general income taxes are applied.',
    example: {
      scenario: 'An employee earns $80,000 gross annual salary, contributing 5% to pre-tax retirement, paying 20% estimated tax, and $200 monthly health insurance.',
      steps: [
        'Annual Retirement = $80,000 x 5% = $4,000',
        'Taxable Wage = $80,000 - $4,000 = $76,000',
        'Annual Tax = $76,000 x 20% = $15,200',
        'Insurance = $200 x 12 = $2,400',
        'Net Annual Take-Home = $80,000 - $4,000 - $15,200 - $2,400 = $58,400'
      ],
      result: 'Weekly paystub net is $1,123.08. Monthly net is $4,866.67.'
    },
    faqs: [
      { question: 'Why does pre-tax retirement save me tax money?', answer: 'Pre-tax contributions are subtracted from gross wages before taxes are calculated, lowering the taxable income base.' },
      { question: 'What standard payroll deductions exist?', answer: 'Typical deductions include federal/state income tax, social security, Medicare, retirement contribution, and medical insurance premiums.' }
    ],
    seoTitle: 'Salary Take-Home Paystub Calculator | FinanceCalc',
    seoDescription: 'Find your monthly net liquid take-home wage. Breakdown weekly, bi-weekly, and monthly payroll deductions instantly.'
  },
  {
    id: 'budget-planner',
    name: '50/30/20 Budget Planner',
    slug: 'budget-planner',
    category: 'savings',
    description: 'Allocate your net monthly income across Needs, Wants, and Savings using the 50/30/20 guideline.',
    longDescription: 'Establish personal financial discipline. Input your take-home monthly salary and core outflows to assess how closely you align with modern personal budgeting guidelines.',
    inputs: [
      { id: 'income', name: 'Net Take-Home Monthly Income', type: 'number', min: 100, max: 100000, step: 100, defaultValue: 5000, prefix: '$' },
      { id: 'housing', name: 'Housing & Rent/Mortgage', type: 'number', min: 0, max: 50000, step: 100, defaultValue: 1600, prefix: '$' },
      { id: 'groceries', name: 'Groceries & Utilities', type: 'number', min: 0, max: 10000, step: 50, defaultValue: 650, prefix: '$' },
      { id: 'dining', name: 'Dining Out & Entertainment', type: 'number', min: 0, max: 10000, step: 50, defaultValue: 500, prefix: '$' },
      { id: 'shopping', name: 'Shopping & Lifestyle', type: 'number', min: 0, max: 10000, step: 50, defaultValue: 450, prefix: '$' },
      { id: 'savings', name: 'Savings & Investments Outflows', type: 'number', min: 0, max: 50000, step: 100, defaultValue: 1000, prefix: '$' },
      { id: 'debt', name: 'Debt Repayments (Cards/Loans)', type: 'number', min: 0, max: 50000, step: 50, defaultValue: 400, prefix: '$' }
    ],
    calculate: (inputs) => {
      const inc = Number(inputs.income);
      const housing = Number(inputs.housing);
      const groceries = Number(inputs.groceries);
      const dining = Number(inputs.dining);
      const shopping = Number(inputs.shopping);
      const savings = Number(inputs.savings);
      const debt = Number(inputs.debt);
      
      const actualNeeds = housing + groceries;
      const actualWants = dining + shopping;
      const actualSavings = savings + debt;
      
      const unallocated = inc - (actualNeeds + actualWants + actualSavings);
      
      const needsPct = inc > 0 ? (actualNeeds / inc) * 100 : 0;
      const wantsPct = inc > 0 ? (actualWants / inc) * 100 : 0;
      const savingsPct = inc > 0 ? (actualSavings / inc) * 100 : 0;
      
      const getStatus = (pct: number, target: number) => {
        if (pct > target + 5) return 'Over budget';
        if (pct < target - 5) return 'Under-allocated';
        return 'Healthy / On Target';
      };
      
      return {
        summary: [
          { label: 'Unallocated Cash', value: `$${unallocated.toFixed(2)}`, color: unallocated >= 0 ? '#16A34A' : '#DC2626' },
          { label: 'Needs Outflow (50% Target)', value: `$${actualNeeds.toLocaleString()} (${needsPct.toFixed(1)}%)`, color: needsPct > 55 ? '#DC2626' : '#2563EB' },
          { label: 'Wants Outflow (30% Target)', value: `$${actualWants.toLocaleString()} (${wantsPct.toFixed(1)}%)`, color: wantsPct > 35 ? '#D97706' : '#1D4ED8' },
          { label: 'Savings & Debt (20% Target)', value: `$${actualSavings.toLocaleString()} (${savingsPct.toFixed(1)}%)`, color: savingsPct < 15 ? '#DC2626' : '#16A34A' }
        ],
        charts: {
          budget: [
            { label: 'Needs', amount: actualNeeds, pct: needsPct, color: '#2563EB', status: getStatus(needsPct, 50) },
            { label: 'Wants', amount: actualWants, pct: wantsPct, color: '#F59E0B', status: getStatus(wantsPct, 30) },
            { label: 'Savings/Debt', amount: actualSavings, pct: savingsPct, color: '#10B981', status: getStatus(savingsPct, 20) }
          ]
        }
      };
    },
    formula: 'Needs = Rent + Utilities + Groceries; Wants = Dining + Shopping; Savings/Debt = Savings Plan + Debt payoffs.',
    formulaExplanation: 'Aligns actual spending metrics against Senator Elizabeth Warren\'s 50/30/20 balanced budget standard.',
    example: {
      scenario: 'Evaluating a $6,000 monthly household take-home income.',
      steps: [
        'Recommended allocations: Needs = $3,000 (50%), Wants = $1,800 (30%), Savings = $1,200 (20%)',
        'Actual outflows: Needs = $2,250 (37.5%), Wants = $2,150 (35.8%), Savings = $1,400 (23.3%)'
      ],
      result: 'Needs are under budget, allowing Wants to exceed normal ratios safely, while keeping Savings higher than 20% targets. Financial posture is highly sustainable.'
    },
    faqs: [
      { question: 'What is the 50/30/20 budgeting standard?', answer: 'Created by Elizabeth Warren, it splits net pay into 50% for vital Needs, 30% for discretionary Wants, and 20% for future Savings or extra debt paydowns.' },
      { question: 'What falls under "Needs" in budgeting?', answer: 'Vital Needs are critical bills required for physical survival, such as housing rent/mortgage, utilities, minimal grocery foods, and basic medical care.' }
    ],
    seoTitle: '50/30/20 Budget Planner & Allocator | FinanceCalc',
    seoDescription: 'Structure your monthly salary. Enter bills, lifestyle spending, and savings to check if you adhere to the 50/30/20 budget framework.'
  }
];
