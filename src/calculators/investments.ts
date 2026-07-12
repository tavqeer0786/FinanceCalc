import { CalculatorDef, GrowthRow } from '../types';

export const investmentCalculators: CalculatorDef[] = [
  {
    id: 'sip',
    name: 'SIP Calculator',
    slug: 'sip-calculator',
    category: 'investment',
    description: 'Calculate future wealth and returns for systematic mutual fund investments (SIP).',
    longDescription: 'Plan your long-term goals by calculating the compound interest returns on your monthly Systematic Investment Plans (SIP) in mutual funds or ETFs.',
    inputs: [
      { id: 'monthly', name: 'Monthly Investment', type: 'number', min: 10, max: 100000, step: 100, defaultValue: 500, prefix: '$' },
      { id: 'rate', name: 'Expected Annual Return', type: 'slider', min: 1, max: 30, step: 0.1, defaultValue: 12, unit: '%' },
      { id: 'years', name: 'Investment Period (Years)', type: 'slider', min: 1, max: 40, step: 1, defaultValue: 15, unit: 'Yrs' },
      { id: 'stepup', name: 'Annual Step-Up (%)', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 0, unit: '%' },
      { id: 'inflation', name: 'Expected Inflation Rate (%)', type: 'slider', min: 0, max: 15, step: 0.5, defaultValue: 0, unit: '%' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.monthly);
      const annualRate = Number(inputs.rate);
      const years = Number(inputs.years);
      const stepUpPct = Number(inputs.stepup || 0);
      const inflationRate = Number(inputs.inflation || 0);
      
      const r = annualRate / 12 / 100;
      
      let currentMonthly = p;
      let accumulatedWealth = 0;
      let accumulatedInvested = 0;
      const growth: GrowthRow[] = [];
      
      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
          accumulatedWealth = (accumulatedWealth + currentMonthly) * (1 + r);
          accumulatedInvested += currentMonthly;
        }
        
        growth.push({
          year: y,
          invested: accumulatedInvested,
          interest: Math.max(0, accumulatedWealth - accumulatedInvested),
          total: accumulatedWealth
        });
        
        // Apply annual step-up after year end
        currentMonthly = currentMonthly * (1 + stepUpPct / 100);
      }
      
      const futureValue = accumulatedWealth;
      const totalInvested = accumulatedInvested;
      const inflationAdjustedFutureValue = futureValue / Math.pow(1 + inflationRate / 100, years);
      const estReturns = Math.max(0, futureValue - totalInvested);
      
      const summary = [
        { label: 'Expected Future Wealth', value: `$${futureValue.toFixed(2)}`, color: '#16A34A' },
        { label: 'Total Invested Amount', value: `$${totalInvested.toLocaleString()}`, color: '#2563EB' },
        { label: 'Estimated Wealth Gained', value: `$${estReturns.toFixed(2)}`, color: '#D97706' }
      ];

      if (inflationRate > 0) {
        summary.push({
          label: `Inflation-Adjusted Future Wealth (at ${inflationRate}%)`,
          value: `$${inflationAdjustedFutureValue.toFixed(2)}`,
          color: '#8B5CF6'
        });
      }
      
      return {
        summary,
        charts: {
          pie: [
            { label: 'Invested Amount', value: totalInvested, color: '#2563EB' },
            { label: 'Wealth Gained', value: estReturns, color: '#D97706' }
          ],
          growth: growth
        }
      };
    },
    formula: 'M = P x [ ( (1 + i)^n - 1 ) / i ] x (1 + i)',
    formulaExplanation: 'Where M is the future maturity value, P is the monthly SIP payment, i is the periodic interest rate (annual rate / 12 / 100), and n is the total number of monthly payments (Years x 12).',
    example: {
      scenario: 'Starting a monthly SIP of $300 in an index fund yielding 12% average annual returns for 20 years.',
      steps: [
        'Monthly Deposit (P) = $300',
        'Monthly Rate (i) = 12% / 12 / 100 = 0.01',
        'Total Payments (n) = 20 x 12 = 240',
        'Future Value (M) = 300 x [((1.01)^240 - 1) / 0.01] x (1.01) = $299,744.38'
      ],
      result: 'Your total out-of-pocket investment is $72,000. Your compound wealth grows to $299,744.38, earning you $227,744.38 in net returns.'
    },
    faqs: [
      { question: 'What is SIP?', answer: 'A Systematic Investment Plan (SIP) is a method of investing a fixed amount of money regularly (typically monthly) into mutual funds or stock portfolios.' },
      { question: 'Does SIP reduce risk?', answer: 'Yes! SIP uses Rupee/Dollar Cost Averaging, meaning you buy more units when prices are low and fewer when prices are high, smoothing out market volatility.' }
    ],
    seoTitle: 'SIP Calculator - Mutual Fund Systematic Investment Plan | FinanceCalc',
    seoDescription: 'Find the future maturity value of your monthly mutual fund SIP. Enter your monthly savings, expected rate of return, and tenure.'
  },
  {
    id: 'fd',
    name: 'FD Calculator (Fixed Deposit)',
    slug: 'fd-calculator',
    category: 'investment',
    description: 'Calculate maturity value and interest earnings on bank Fixed Deposits (FD).',
    longDescription: 'Estimate your interest income on bank term deposits with standard quarterly compounding instantly. Ensure your safe investments align with savings targets.',
    inputs: [
      { id: 'principal', name: 'Deposit Amount', type: 'number', min: 100, max: 10000000, step: 500, defaultValue: 10000, prefix: '$' },
      { id: 'rate', name: 'Rate of Interest (Annual)', type: 'slider', min: 1, max: 20, step: 0.1, defaultValue: 6.5, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 1, max: 15, step: 1, defaultValue: 5, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.principal);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      
      const compFreq = 4; // Quarterly standard compounding
      const totalAmount = p * Math.pow(1 + (r / 100) / compFreq, compFreq * y);
      const interestEarned = totalAmount - p;
      
      const growth: GrowthRow[] = [];
      for (let i = 1; i <= y; i++) {
        const amtI = p * Math.pow(1 + (r / 100) / compFreq, compFreq * i);
        growth.push({
          year: i,
          invested: p,
          interest: amtI - p,
          total: amtI
        });
      }
      
      return {
        summary: [
          { label: 'Total Maturity Amount', value: `$${totalAmount.toFixed(2)}`, color: '#16A34A' },
          { label: 'Principal Amount', value: `$${p.toLocaleString()}`, color: '#2563EB' },
          { label: 'Interest Earnings', value: `$${interestEarned.toFixed(2)}`, color: '#D97706' }
        ],
        charts: {
          pie: [
            { label: 'Principal Amount', value: p, color: '#2563EB' },
            { label: 'Interest Earned', value: interestEarned, color: '#D97706' }
          ],
          growth: growth
        }
      };
    },
    formula: 'A = P x (1 + R/N)^(N x T)',
    formulaExplanation: 'Where A is the Maturity Amount, P is Principal, R is annual rate (decimal), N is compounding cycles per year (N=4 for quarterly), and T is tenure in years.',
    example: {
      scenario: 'Depositing $10,000 for 5 years at an interest rate of 7.0% compounded quarterly.',
      steps: [
        'P = $10,000, R = 0.07, N = 4, T = 5',
        'Maturity Amount (A) = 10000 x (1 + 0.07/4)^(4 x 5) = $14,147.78'
      ],
      result: 'At maturity, you receive $14,147.78. This includes your $10,000 deposit and $4,147.78 interest earned.'
    },
    faqs: [
      { question: 'How is FD interest compounded?', answer: 'In most commercial banks, fixed deposit interest is compounded quarterly. This means you earn interest on interest four times a year.' },
      { question: 'Is FD interest taxable?', answer: 'Yes, interest earned from bank Fixed Deposits is fully taxable as income, subject to regional tax brackets.' }
    ],
    seoTitle: 'Bank Fixed Deposit (FD) Interest Calculator | FinanceCalc',
    seoDescription: 'Calculate bank Fixed Deposit (FD) maturity amount and interest earned with our free online quarterly compounding FD calculator.'
  },
  {
    id: 'rd',
    name: 'RD Calculator (Recurring Deposit)',
    slug: 'rd-calculator',
    category: 'investment',
    description: 'Calculate maturity values of regular monthly Recurring Deposits.',
    longDescription: 'Establish systematic compounding for Recurring Deposits. Learn how small monthly inputs grow securely into lump sums via quarterly bank interest compounding.',
    inputs: [
      { id: 'monthly', name: 'Monthly RD Amount', type: 'number', min: 10, max: 100000, step: 100, defaultValue: 200, prefix: '$' },
      { id: 'rate', name: 'Rate of Interest', type: 'slider', min: 1, max: 15, step: 0.1, defaultValue: 6.2, unit: '%' },
      { id: 'years', name: 'RD Period (Years)', type: 'slider', min: 1, max: 10, step: 1, defaultValue: 3, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.monthly);
      const r = Number(inputs.rate);
      const years = Number(inputs.years);
      
      const totalMonths = years * 12;
      const rateFraction = r / 100;
      
      // Calculate RD using quarterly compounding standard banking formula:
      // A = P * sum( (1 + r/4) ^ (4 * (totalMonths - i + 1)/12) )
      let maturityValue = 0;
      for (let i = 1; i <= totalMonths; i++) {
        const factor = (totalMonths - i + 1) / 12;
        maturityValue += p * Math.pow(1 + rateFraction / 4, 4 * factor);
      }
      
      const totalInvested = p * totalMonths;
      const interest = Math.max(0, maturityValue - totalInvested);
      
      const growth: GrowthRow[] = [];
      for (let y = 1; y <= years; y++) {
        const mY = y * 12;
        let mvY = 0;
        for (let i = 1; i <= mY; i++) {
          const factor = (mY - i + 1) / 12;
          mvY += p * Math.pow(1 + rateFraction / 4, 4 * factor);
        }
        growth.push({
          year: y,
          invested: p * mY,
          interest: Math.max(0, mvY - p * mY),
          total: mvY
        });
      }
      
      return {
        summary: [
          { label: 'Total Maturity Amount', value: `$${maturityValue.toFixed(2)}`, color: '#16A34A' },
          { label: 'Total Principal Saved', value: `$${totalInvested.toLocaleString()}`, color: '#2563EB' },
          { label: 'Interest Accumulated', value: `$${interest.toFixed(2)}`, color: '#D97706' }
        ],
        charts: {
          pie: [
            { label: 'Principal Invested', value: totalInvested, color: '#2563EB' },
            { label: 'Interest Income', value: interest, color: '#D97706' }
          ],
          growth: growth
        }
      };
    },
    formula: 'Maturity standard is calculated as: A = P x Sum[ (1 + R/4)^(4 x Month/12) ]',
    formulaExplanation: 'Since contributions occur monthly but interest compounds quarterly, the formula compounds each monthly premium individually based on how long it remains in the account.',
    example: {
      scenario: 'Depositing $100 monthly into an RD for 2 years at an interest rate of 6.0%.',
      steps: [
        'Monthly deposit = $100, Months = 24',
        'Total Principal saved = $2,400',
        'Maturity Value after compound = $2,553.80'
      ],
      result: 'At maturity, you receive $2,553.80. The interest earned is $153.80.'
    },
    faqs: [
      { question: 'What is a Recurring Deposit (RD)?', answer: 'An RD is a term deposit that lets you save a fixed sum monthly. It compounds like a Fixed Deposit, but with smaller ongoing contributions.' },
      { question: 'Can I withdraw my RD early?', answer: 'Yes, premature withdrawal is permitted, but banks apply a penalty of around 0.5% to 1.0% on the applicable interest rate.' }
    ],
    seoTitle: 'Bank Recurring Deposit (RD) Calculator | FinanceCalc',
    seoDescription: 'Calculate Recurring Deposit (RD) interest rate and maturity amount. Plan monthly saving contributions and check total capital earnings.'
  },
  {
    id: 'ppf',
    name: 'PPF Calculator (Public Provident Fund)',
    slug: 'ppf-calculator',
    category: 'investment',
    description: 'Calculate interest returns on tax-free Public Provident Fund accounts.',
    longDescription: 'Establish long-term sovereign wealth predictions. Our PPF calculator calculates the compounding of annual sovereign pension accounts over their standard 15-year terms.',
    inputs: [
      { id: 'annual', name: 'Yearly Contribution', type: 'number', min: 100, max: 200000, step: 1000, defaultValue: 5000, prefix: '$' },
      { id: 'rate', name: 'PPF Interest Rate', type: 'slider', min: 5, max: 12, step: 0.1, defaultValue: 7.1, unit: '%' },
      { id: 'years', name: 'Period (Years)', type: 'slider', min: 15, max: 50, step: 5, defaultValue: 15, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.annual);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      
      const rPct = r / 100;
      
      // PPF Compounding occurs annually, assuming deposits are made at the beginning of the year
      let maturity = 0;
      const growth: GrowthRow[] = [];
      
      for (let i = 1; i <= y; i++) {
        maturity = (maturity + p) * (1 + rPct);
        growth.push({
          year: i,
          invested: p * i,
          interest: Math.max(0, maturity - p * i),
          total: maturity
        });
      }
      
      const invested = p * y;
      const interest = Math.max(0, maturity - invested);
      
      return {
        summary: [
          { label: 'PPF Maturity Value', value: `$${maturity.toFixed(2)}`, color: '#16A34A' },
          { label: 'Total Invested Amount', value: `$${invested.toLocaleString()}`, color: '#2563EB' },
          { label: 'Total Sovereign Interest', value: `$${interest.toFixed(2)}`, color: '#D97706' }
        ],
        charts: {
          pie: [
            { label: 'Principal Invested', value: invested, color: '#2563EB' },
            { label: 'Tax-Free Interest', value: interest, color: '#D97706' }
          ],
          growth: growth
        }
      };
    },
    formula: 'F = P x [ ( (1 + r)^y - 1 ) / r ] x (1 + r)',
    formulaExplanation: 'Where F is the maturity amount, P is yearly deposit made at the start of the year, r is the annual rate (decimal), and y is the total years (min 15).',
    example: {
      scenario: 'Saving $2,000 annually at the fixed sovereign rate of 7.1% for the standard 15-year lock-in period.',
      steps: [
        'P = $2,000, r = 0.071, y = 15',
        'Maturity Value = $2,000 x [((1.071)^15 - 1) / 0.071] x (1.071) = $54,364.50'
      ],
      result: 'Your total invested capital is $30,000. Under sovereign compounding, you earn $24,364.50 tax-free interest, making a total maturity value of $54,364.50.'
    },
    faqs: [
      { question: 'What is the sovereign PPF account lock-in?', answer: 'The PPF account has a mandatory lock-in period of 15 years, but partial withdrawals are allowed after 7 years under specific rules.' },
      { question: 'Is PPF interest completely tax-exempt?', answer: 'Yes, PPF follows the Exempt-Exempt-Exempt (EEE) status, making your deposits, interest, and final withdrawals tax-free.' }
    ],
    seoTitle: 'PPF Sovereign Savings Calculator - 15 Year Compounding | FinanceCalc',
    seoDescription: 'Calculate tax-free interest and maturity values for Public Provident Fund accounts. Track 15-year lock-in sovereign growth.'
  },
  {
    id: 'mutual-fund',
    name: 'Mutual Fund Calculator',
    slug: 'mutual-fund-calculator',
    category: 'investment',
    description: 'Calculate potential returns for both lumpsum and SIP mutual fund investments.',
    longDescription: 'Assess prospective returns across both SIP and Lumpsum mutual fund paths. Contrast compounding growth variables dynamically to optimize your portfolio.',
    inputs: [
      { id: 'type', name: 'Investment Type', type: 'select', options: [{ label: 'SIP (Monthly)', value: 1 }, { label: 'Lump Sum (One-Time)', value: 2 }], defaultValue: 1 },
      { id: 'amount', name: 'Investment Amount', type: 'number', min: 10, max: 10000000, step: 500, defaultValue: 2000, prefix: '$' },
      { id: 'rate', name: 'Expected Return Rate', type: 'slider', min: 1, max: 25, step: 0.1, defaultValue: 11.5, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 1, max: 35, step: 1, defaultValue: 10, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const type = Number(inputs.type);
      const amt = Number(inputs.amount);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      
      const rateDec = r / 100;
      let totalAmount = 0;
      let totalInvested = 0;
      const growth: GrowthRow[] = [];
      
      if (type === 1) {
        // SIP
        const monthlyRate = r / 12 / 100;
        const totalMonths = y * 12;
        if (monthlyRate > 0) {
          totalAmount = amt * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
        } else {
          totalAmount = amt * totalMonths;
        }
        totalInvested = amt * totalMonths;
        
        for (let i = 1; i <= y; i++) {
          const m = i * 12;
          const amtI = amt * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
          growth.push({
            year: i,
            invested: amt * m,
            interest: Math.max(0, amtI - amt * m),
            total: amtI
          });
        }
      } else {
        // Lump sum
        totalAmount = amt * Math.pow(1 + rateDec, y);
        totalInvested = amt;
        
        for (let i = 1; i <= y; i++) {
          const amtI = amt * Math.pow(1 + rateDec, i);
          growth.push({
            year: i,
            invested: amt,
            interest: amtI - amt,
            total: amtI
          });
        }
      }
      
      const interest = Math.max(0, totalAmount - totalInvested);
      
      return {
        summary: [
          { label: 'Expected Wealth', value: `$${totalAmount.toFixed(2)}`, color: '#16A34A' },
          { label: 'Total Investment', value: `$${totalInvested.toLocaleString()}`, color: '#2563EB' },
          { label: 'Estimated Wealth Gained', value: `$${interest.toFixed(2)}`, color: '#D97706' }
        ],
        charts: {
          pie: [
            { label: 'Total Invested', value: totalInvested, color: '#2563EB' },
            { label: 'Gain', value: interest, color: '#D97706' }
          ],
          growth: growth
        }
      };
    },
    formula: 'SIP Formula: M = P x [((1 + i)^n - 1) / i] x (1+i); Lumpsum Formula: A = P x (1 + r)^t',
    formulaExplanation: 'SIP models regular periodic compounding, whereas lump sums grow on a single base principal continuously compounded.',
    example: {
      scenario: 'Comparing a one-time lump sum of $10,000 vs. a monthly SIP of $100 over a 10-year horizon at 12% returns.',
      steps: [
        'Lump Sum Future Value = $10,000 x (1.12)^10 = $31,058.48',
        'SIP Total Invested = $12,000; Future Value = $100 x [((1.01)^120 - 1) / 0.01] x 1.01 = $23,233.91'
      ],
      result: 'Lumpsum yields $21,058.48 in gains. SIP yields $11,233.91 in gains.'
    },
    faqs: [
      { question: 'What is a mutual fund?', answer: 'A mutual fund is a trust that pools money from many investors to invest in securities like stocks, bonds, and short-term debt.' },
      { question: 'Which is better: SIP or Lumpsum?', answer: 'SIP is best for salary earners to hedge market timing risks, while Lumpsum is perfect when you receive a sudden windfall or find stock markets undervalued.' }
    ],
    seoTitle: 'Mutual Fund Returns Calculator | FinanceCalc',
    seoDescription: 'Estimate potential mutual fund investment returns. Calculate and contrast SIP and Lump sum investment futures side-by-side.'
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    slug: 'compound-interest-calculator',
    category: 'investment',
    description: 'Calculate how compound interest grows your investments over time.',
    longDescription: 'The power of compounding is the eighth wonder of the world. Enter a base principal, monthly additions, and compounding frequency to find your future wealth.',
    inputs: [
      { id: 'principal', name: 'Initial Principal', type: 'number', min: 10, max: 10000000, step: 1000, defaultValue: 10000, prefix: '$' },
      { id: 'addition', name: 'Monthly Addition', type: 'number', min: 0, max: 100000, step: 100, defaultValue: 200, prefix: '$' },
      { id: 'rate', name: 'Annual Interest Rate', type: 'slider', min: 1, max: 30, step: 0.1, defaultValue: 8.0, unit: '%' },
      { id: 'years', name: 'Period (Years)', type: 'slider', min: 1, max: 40, step: 1, defaultValue: 10, unit: 'Yrs' },
      { id: 'frequency', name: 'Compounding Frequency', type: 'select', options: [{ label: 'Monthly', value: 12 }, { label: 'Quarterly', value: 4 }, { label: 'Annually', value: 1 }], defaultValue: 12 }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.principal);
      const pmt = Number(inputs.addition);
      const r = Number(inputs.rate) / 100;
      const t = Number(inputs.years);
      const n = Number(inputs.frequency);
      
      const growth: GrowthRow[] = [];
      let total = p;
      let invested = p;
      
      // Step-by-step calculation to keep it incredibly accurate with monthly payments and custom compound frequencies
      for (let y = 1; y <= t; y++) {
        // Compound initial principal and additions over the year
        const pCompound = p * Math.pow(1 + r / n, n * y);
        
        let pmtCompound = 0;
        if (pmt > 0) {
          const totalPMTPeriods = y * 12;
          const ratePerPMT = r / 12;
          pmtCompound = pmt * ((Math.pow(1 + ratePerPMT, totalPMTPeriods) - 1) / ratePerPMT);
        }
        
        const totalYear = pCompound + pmtCompound;
        const investedYear = p + pmt * (y * 12);
        
        growth.push({
          year: y,
          invested: investedYear,
          interest: Math.max(0, totalYear - investedYear),
          total: totalYear
        });
        
        if (y === t) {
          total = totalYear;
          invested = investedYear;
        }
      }
      
      const interest = Math.max(0, total - invested);
      
      return {
        summary: [
          { label: 'Future Value', value: `$${total.toFixed(2)}`, color: '#16A34A' },
          { label: 'Total Invested Principal', value: `$${invested.toLocaleString()}`, color: '#2563EB' },
          { label: 'Total Interest Earned', value: `$${interest.toFixed(2)}`, color: '#D97706' }
        ],
        charts: {
          pie: [
            { label: 'Invested Capital', value: invested, color: '#2563EB' },
            { label: 'Interest Gains', value: interest, color: '#D97706' }
          ],
          growth: growth
        }
      };
    },
    formula: 'A = P x (1 + r/n)^(nt) + PMT x [ ((1 + r/n)^(nt) - 1) / (r/n) ]',
    formulaExplanation: 'Where P is principal, PMT is periodic payment, r is rate, n is compounding cycles per year, and t is time in years.',
    example: {
      scenario: 'Investing $5,000 as initial principal, adding $100 monthly, at an 8% interest rate compounded monthly for 10 years.',
      steps: [
        'P = $5,000, PMT = $100, r = 0.08, n = 12, t = 10',
        'Compound principal portion = $11,098.20',
        'Compound annuity payment portion = $18,294.60',
        'Total sum = $11,098.20 + $18,294.60 = $29,392.80'
      ],
      result: 'Your investments will grow to $29,392.80. You invested $17,000 in total and earned $12,392.80 interest.'
    },
    faqs: [
      { question: 'What is compound interest?', answer: 'Compound interest is earning interest on your initial principal plus all the interest accumulated from prior periods.' },
      { question: 'How does compounding frequency affect growth?', answer: 'More frequent compounding (such as daily or monthly instead of annually) yields slightly higher returns as interest begins compounding sooner.' }
    ],
    seoTitle: 'Compound Interest Calculator - Future Wealth Planner | FinanceCalc',
    seoDescription: 'Calculate standard compound interest growth on savings and investments with optional recurring monthly deposits.'
  },
  {
    id: 'simple-interest',
    name: 'Simple Interest Calculator',
    slug: 'simple-interest-calculator',
    category: 'investment',
    description: 'Calculate standard, non-compounding simple interest on loans or investments.',
    longDescription: 'Quickly find simple interest calculations. Ideal for standard private loans, interest notes, and basic mathematical cash models.',
    inputs: [
      { id: 'principal', name: 'Principal Amount', type: 'number', min: 10, max: 10000000, step: 500, defaultValue: 5000, prefix: '$' },
      { id: 'rate', name: 'Annual Interest Rate', type: 'slider', min: 1, max: 30, step: 0.1, defaultValue: 6.0, unit: '%' },
      { id: 'years', name: 'Time Period (Years)', type: 'slider', min: 1, max: 20, step: 1, defaultValue: 3, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.principal);
      const r = Number(inputs.rate);
      const t = Number(inputs.years);
      
      const interest = (p * r * t) / 100;
      const total = p + interest;
      
      const growth: GrowthRow[] = [];
      for (let i = 1; i <= t; i++) {
        growth.push({
          year: i,
          invested: p,
          interest: (p * r * i) / 100,
          total: p + (p * r * i) / 100
        });
      }
      
      return {
        summary: [
          { label: 'Total Value', value: `$${total.toFixed(2)}`, color: '#16A34A' },
          { label: 'Principal Amount', value: `$${p.toLocaleString()}`, color: '#2563EB' },
          { label: 'Simple Interest Earned', value: `$${interest.toFixed(2)}`, color: '#D97706' }
        ],
        charts: {
          pie: [
            { label: 'Principal', value: p, color: '#2563EB' },
            { label: 'Simple Interest', value: interest, color: '#D97706' }
          ],
          growth: growth
        }
      };
    },
    formula: 'I = (P x R x T) / 100',
    formulaExplanation: 'Where I is interest earned, P is Principal, R is annual rate (%), and T is time in years.',
    example: {
      scenario: 'Lending a relative $5,000 for 3 years at 6.0% simple interest.',
      steps: [
        'P = $5,000, R = 6, T = 3',
        'Interest = (5000 x 6 x 3) / 100 = $900'
      ],
      result: 'The total returned amount is $5,900, which includes $900 simple interest.'
    },
    faqs: [
      { question: 'How does simple interest differ from compound interest?', answer: 'Simple interest is calculated purely on the principal amount, whereas compound interest is calculated on principal plus accrued interest.' },
      { question: 'Where is simple interest typically used?', answer: 'Simple interest is frequently utilized in short-term personal notes, specific auto loans, and standard checking account structures.' }
    ],
    seoTitle: 'Simple Interest Calculator - Simple Formula | FinanceCalc',
    seoDescription: 'Find interest earned with the simple interest equation. Enter principal, annual rate, and time term to see absolute earnings.'
  },
  {
    id: 'investment-return',
    name: 'Investment Return & CAGR Calculator',
    slug: 'investment-return-calculator',
    category: 'investment',
    description: 'Calculate Absolute Return and CAGR (Compound Annual Growth Rate) of any asset.',
    longDescription: 'Analyze your stock, real estate, or fund performance. Calculate compound annual growth rates (CAGR) and total absolute returns instantly.',
    inputs: [
      { id: 'initial', name: 'Initial Investment Value', type: 'number', min: 10, max: 10000000, step: 1000, defaultValue: 10000, prefix: '$' },
      { id: 'final', name: 'Final Asset Value', type: 'number', min: 10, max: 50000000, step: 1000, defaultValue: 25000, prefix: '$' },
      { id: 'years', name: 'Holding Period (Years)', type: 'slider', min: 0.5, max: 30, step: 0.5, defaultValue: 5, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const initial = Number(inputs.initial);
      const final = Number(inputs.final);
      const y = Number(inputs.years);
      
      const absReturn = ((final - initial) / initial) * 100;
      const cagr = (Math.pow(final / initial, 1 / y) - 1) * 100;
      const totalGain = final - initial;
      
      return {
        summary: [
          { label: 'CAGR (Annualized Return)', value: `${cagr.toFixed(2)}%`, color: '#16A34A' },
          { label: 'Absolute Return', value: `${absReturn.toFixed(2)}%`, color: '#2563EB' },
          { label: 'Net Profit', value: `$${totalGain.toLocaleString()}`, color: '#D97706' }
        ],
        charts: {
          pie: [
            { label: 'Initial Investment', value: initial, color: '#2563EB' },
            { label: 'Capital Gain', value: Math.max(0, totalGain), color: '#16A34A' }
          ]
        }
      };
    },
    formula: 'Absolute Return = [(Final - Initial) / Initial] x 100; CAGR = [(Final / Initial)^(1 / Years) - 1] x 100',
    formulaExplanation: 'Absolute Return displays net nominal growth percentage, while CAGR annualizes performance to show growth as a smooth yearly speed.',
    example: {
      scenario: 'Buying a mutual fund index portfolio for $10,000 and selling it 5 years later for $18,000.',
      steps: [
        'Absolute Return = [($18,000 - $10,000) / $10,000] x 100 = 80.00%',
        'CAGR = [($18,000 / $10,000)^(1 / 5) - 1] x 100 = 12.47%'
      ],
      result: 'The asset gained 80.00% overall. On an annualized basis, this equals a CAGR of 12.47%.'
    },
    faqs: [
      { question: 'What does CAGR measure?', answer: 'CAGR is Compound Annual Growth Rate. It represents the smooth constant rate at which an asset would have grown if it compounded annually.' },
      { question: 'Why is CAGR better than Absolute Return?', answer: 'CAGR accounts for the time horizon, allowing you to accurately compare the performance of investments held over different lengths of time.' }
    ],
    seoTitle: 'Investment Return & CAGR Calculator | FinanceCalc',
    seoDescription: 'Calculate compound annual growth rate (CAGR) and absolute returns of stocks, funds, or real estate assets.'
  }
];
