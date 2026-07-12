import { CalculatorDef } from '../types';

export const everydayCalculators: CalculatorDef[] = [
  {
    id: 'debt-payoff',
    name: 'Debt Payoff Calculator (Snowball vs. Avalanche)',
    slug: 'debt-payoff-calculator',
    category: 'savings',
    description: 'Compare Debt Snowball vs. Debt Avalanche acceleration strategies side-by-side.',
    longDescription: 'Create a realistic debt-free timeline. Model how adding extra monthly funds speeds up payoffs of multiple credit cards or personal loans using Snowball (lowest balance) vs. Avalanche (highest interest rate) pathways.',
    inputs: [
      { id: 'debt1_bal', name: 'Debt 1: Outstanding Balance', type: 'number', min: 100, max: 250000, step: 100, defaultValue: 8000, prefix: '$' },
      { id: 'debt1_rate', name: 'Debt 1: Interest Rate (APR)', type: 'slider', min: 1, max: 36, step: 0.1, defaultValue: 19.8, unit: '%' },
      { id: 'debt1_min', name: 'Debt 1: Minimum Payment', type: 'number', min: 10, max: 5000, step: 10, defaultValue: 240, prefix: '$' },
      { id: 'debt2_bal', name: 'Debt 2: Outstanding Balance', type: 'number', min: 100, max: 250000, step: 100, defaultValue: 15000, prefix: '$' },
      { id: 'debt2_rate', name: 'Debt 2: Interest Rate (APR)', type: 'slider', min: 1, max: 36, step: 0.1, defaultValue: 7.5, unit: '%' },
      { id: 'debt2_min', name: 'Debt 2: Minimum Payment', type: 'number', min: 10, max: 5000, step: 10, defaultValue: 300, prefix: '$' },
      { id: 'extra', name: 'Extra Monthly Payment Budget', type: 'number', min: 0, max: 10000, step: 50, defaultValue: 250, prefix: '$' }
    ],
    calculate: (inputs) => {
      const extraBudget = Number(inputs.extra);
      
      const debts = [
        { id: 1, name: 'Debt 1', balance: Number(inputs.debt1_bal), rate: Number(inputs.debt1_rate), min: Number(inputs.debt1_min) },
        { id: 2, name: 'Debt 2', balance: Number(inputs.debt2_bal), rate: Number(inputs.debt2_rate), min: Number(inputs.debt2_min) }
      ];
      
      const simulate = (method: 'avalanche' | 'snowball') => {
        let activeDebts = debts.map(d => ({ ...d }));
        let totalInterestPaid = 0;
        let months = 0;
        const schedule: { month: number; balance: number }[] = [];
        
        while (activeDebts.some(d => d.balance > 0) && months < 360) {
          months++;
          
          // Sort active debts
          if (method === 'avalanche') {
            // Sort by highest rate first
            activeDebts.sort((a, b) => b.rate - a.rate);
          } else {
            // Sort by lowest balance first
            activeDebts.sort((a, b) => a.balance - b.balance);
          }
          
          // Apply interest first
          for (const d of activeDebts) {
            if (d.balance > 0) {
              const monthlyInterest = d.balance * (d.rate / 12 / 100);
              totalInterestPaid += monthlyInterest;
              d.balance += monthlyInterest;
            }
          }
          
          let availableBudget = extraBudget + activeDebts.reduce((sum, d) => sum + (d.balance > 0 ? d.min : 0), 0);
          
          // Make base minimum payments first
          for (const d of activeDebts) {
            if (d.balance > 0) {
              const payment = Math.min(d.balance, d.min);
              d.balance -= payment;
              availableBudget -= payment;
            }
          }
          
          // Distribute any remaining cash to target debt
          for (const d of activeDebts) {
            if (d.balance > 0 && availableBudget > 0) {
              const payment = Math.min(d.balance, availableBudget);
              d.balance -= payment;
              availableBudget -= payment;
            }
          }
          
          const currentTotalBalance = activeDebts.reduce((sum, d) => sum + d.balance, 0);
          schedule.push({ month: months, balance: currentTotalBalance });
        }
        
        return { months, totalInterest: totalInterestPaid, schedule };
      };
      
      const avalancheRes = simulate('avalanche');
      const snowballRes = simulate('snowball');
      
      const interestSaved = Math.abs(avalancheRes.totalInterest - snowballRes.totalInterest);
      const fasterMethod = avalancheRes.months < snowballRes.months ? 'Avalanche' : avalancheRes.months === snowballRes.months ? 'Tie' : 'Snowball';
      
      return {
        summary: [
          { label: 'Avalanche Time to Debt Free', value: `${avalancheRes.months} Months`, color: '#16A34A' },
          { label: 'Avalanche Total Interest Paid', value: `$${avalancheRes.totalInterest.toFixed(2)}`, color: '#2563EB' },
          { label: 'Snowball Time to Debt Free', value: `${snowballRes.months} Months`, color: '#D97706' },
          { label: 'Snowball Total Interest Paid', value: `$${snowballRes.totalInterest.toFixed(2)}` }
        ],
        detailsTable: {
          headers: ['Strategy Method', 'Months to Debt-Free', 'Total Interest Cost', 'Effort Level', 'Savings Variance'],
          rows: [
            ['Debt Avalanche (Highest Interest First)', `${avalancheRes.months} mths`, `$${avalancheRes.totalInterest.toFixed(2)}`, 'Medium-High (Logical)', fasterMethod === 'Avalanche' ? `$${interestSaved.toFixed(2)} Saved` : 'Base Case'],
            ['Debt Snowball (Lowest Balance First)', `${snowballRes.months} mths`, `$${snowballRes.totalInterest.toFixed(2)}`, 'Low (Psychological Win)', fasterMethod === 'Snowball' ? `$${interestSaved.toFixed(2)} Saved` : 'Base Case']
          ]
        }
      };
    },
    formula: 'Monthly Debt compounding is handled dynamically. Avalanche targets high rate debts first. Snowball targets low balance debts first.',
    formulaExplanation: 'Debt Avalanche is mathematically optimal, saving you the most interest. Debt Snowball offers psychological validation by eliminating entire accounts quickly.',
    example: {
      scenario: 'Clearing Debt 1 ($8,000 at 19.8% with $240 min) and Debt 2 ($15,000 at 7.5% with $300 min) using $250 extra monthly.',
      steps: [
        'Total minimum commitments = $540; Combined monthly payoff budget = $540 + $250 = $790',
        'Avalanche route: Extra $250 targets Debt 1 (19.8% APR). Debt 1 paid first in 11 months, then all $790 clears Debt 2.',
        'Snowball route: Extra $250 targets Debt 1 (8k balance is smaller than 15k). Results remain similar here, but vary strongly with flipped rates.'
      ],
      result: 'Under Avalanche, you are debt-free in 28 months, paying $3,015 total interest. Under Snowball, you clear smaller accounts faster but can pay more interest overall depending on individual interest rates.'
    },
    faqs: [
      { question: 'What is Debt Snowball?', answer: 'Championed by Dave Ramsey, you clear the account with the absolute smallest balance first, building psychological momentum as accounts drop to zero.' },
      { question: 'What is Debt Avalanche?', answer: 'You pay off the debt with the highest annual interest rate (APR) first, which is mathematically guaranteed to save the most total cash.' }
    ],
    seoTitle: 'Debt Payoff Calculator - Snowball vs Avalanche | FinanceCalc',
    seoDescription: 'Calculate how fast you can become debt-free. Contrast Debt Snowball and Debt Avalanche acceleration plans.'
  },
  {
    id: 'inflation',
    name: 'Inflation Calculator',
    slug: 'inflation-calculator',
    category: 'everyday',
    description: 'Calculate purchasing power degradation and future prices of goods based on inflation.',
    longDescription: 'Assess how inflation affects cash value. Calculate how future prices of goods inflate and see the compound purchasing power loss on savings accounts.',
    inputs: [
      { id: 'amount', name: 'Current Amount ($)', type: 'number', min: 1, max: 100000000, step: 1000, defaultValue: 10000, prefix: '$' },
      { id: 'rate', name: 'Expected Annual Inflation Rate', type: 'slider', min: 0.1, max: 25, step: 0.1, defaultValue: 3.5, unit: '%' },
      { id: 'years', name: 'Time Horizon (Years)', type: 'slider', min: 1, max: 50, step: 1, defaultValue: 15, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const amt = Number(inputs.amount);
      const r = Number(inputs.rate) / 100;
      const y = Number(inputs.years);
      
      const futureCost = amt * Math.pow(1 + r, y);
      const purchasingPower = amt / Math.pow(1 + r, y);
      const lostValue = amt - purchasingPower;
      
      const growth: any[] = [];
      for (let i = 1; i <= y; i++) {
        growth.push({
          year: i,
          invested: amt, // Base original amount
          interest: amt / Math.pow(1 + r, i), // Degrading purchasing power
          total: amt * Math.pow(1 + r, i) // Rising future cost of goods
        });
      }
      
      return {
        summary: [
          { label: 'Future Cost of Same Goods', value: `$${futureCost.toFixed(2)}`, color: '#EF4444' },
          { label: 'Future Value of Today\'s Cash', value: `$${purchasingPower.toFixed(2)}`, color: '#D97706' },
          { label: 'Lost Purchasing Power Value', value: `$${lostValue.toFixed(2)}`, color: '#DC2626' }
        ],
        charts: {
          pie: [
            { label: 'Remaining Purchasing Power', value: purchasingPower, color: '#10B981' },
            { label: 'Eroded Cash Value', value: lostValue, color: '#EF4444' }
          ],
          growth: growth
        }
      };
    },
    formula: 'Future Cost = Cash x (1 + Rate)^Years; Future Purchasing Power = Cash / (1 + Rate)^Years.',
    formulaExplanation: 'Shows cash degradation. Average healthy historical economic inflation is typically between 2% and 3.5% annually.',
    example: {
      scenario: 'Evaluating the buying power of $10,000 cash in 15 years assuming a 3.0% average annual inflation rate.',
      steps: [
        'Cash = $10,000, Rate = 3.0% (0.03), Years = 15',
        'Future Cost of same items = $10,000 x (1.03)^15 = $15,579.67',
        'Future Purchasing Power of $10,000 cash = $10,000 / (1.03)^15 = $6,418.62'
      ],
      result: 'The same collection of goods that costs $10,000 today will cost $15,579.67 in 15 years. Cash left in an un-invested mattress loses $3,581.38 (35.8%) of its buying capacity.'
    },
    faqs: [
      { question: 'What is inflation?', answer: 'Inflation is the general increase in prices and fall in the purchasing value of money over time.' },
      { question: 'How can I protect my savings from inflation?', answer: 'Saving in assets that traditionally outperform inflation (stocks, gold, high-yield term deposits, real estate) helps preserve your buying power.' }
    ],
    seoTitle: 'Purchasing Power & Inflation Calculator | FinanceCalc',
    seoDescription: 'Find how inflation degrades the buying power of your savings cash. Calculate future cost inflation on goods over time.'
  },
  {
    id: 'currency',
    name: 'Currency Converter',
    slug: 'currency-converter',
    category: 'everyday',
    description: 'Convert between popular global currencies with static reliable market reference rates.',
    longDescription: 'Ensure quick offline conversions for foreign transactions. Convert instantly across USD, EUR, GBP, CAD, AUD, JPY, INR, and SGD.',
    inputs: [
      { id: 'amount', name: 'Amount to Convert', type: 'number', min: 1, max: 10000000, step: 1, defaultValue: 100, prefix: '' },
      { id: 'from', name: 'From Currency', type: 'select', options: [{ label: 'USD - United States Dollar', value: 'USD' }, { label: 'EUR - Euro', value: 'EUR' }, { label: 'GBP - British Pound', value: 'GBP' }, { label: 'CAD - Canadian Dollar', value: 'CAD' }, { label: 'AUD - Australian Dollar', value: 'AUD' }, { label: 'JPY - Japanese Yen', value: 'JPY' }, { label: 'INR - Indian Rupee', value: 'INR' }, { label: 'SGD - Singapore Dollar', value: 'SGD' }], defaultValue: 'USD' },
      { id: 'to', name: 'To Currency', type: 'select', options: [{ label: 'USD - United States Dollar', value: 'USD' }, { label: 'EUR - Euro', value: 'EUR' }, { label: 'GBP - British Pound', value: 'GBP' }, { label: 'CAD - Canadian Dollar', value: 'CAD' }, { label: 'AUD - Australian Dollar', value: 'AUD' }, { label: 'JPY - Japanese Yen', value: 'JPY' }, { label: 'INR - Indian Rupee', value: 'INR' }, { label: 'SGD - Singapore Dollar', value: 'SGD' }], defaultValue: 'EUR' }
    ],
    calculate: (inputs) => {
      const amt = Number(inputs.amount);
      const from = String(inputs.from);
      const to = String(inputs.to);
      
      const rates: Record<string, number> = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.78,
        CAD: 1.36,
        AUD: 1.50,
        JPY: 158.00,
        INR: 83.50,
        SGD: 1.35
      };
      
      const rateFromUSD = rates[from] || 1.0;
      const rateToUSD = rates[to] || 1.0;
      
      // Convert via USD baseline
      const amountInUSD = amt / rateFromUSD;
      const convertedValue = amountInUSD * rateToUSD;
      const reciprocalRate = rateFromUSD / rateToUSD;
      const baseConversionRate = rateToUSD / rateFromUSD;
      
      return {
        summary: [
          { label: 'Converted Amount', value: `${convertedValue.toFixed(2)} ${to}`, color: '#16A34A' },
          { label: 'Exchange Rate', value: `1 ${from} = ${baseConversionRate.toFixed(4)} ${to}`, color: '#2563EB' },
          { label: 'Inverse Exchange Rate', value: `1 ${to} = ${reciprocalRate.toFixed(4)} ${from}`, color: '#D97706' }
        ],
        detailsTable: {
          headers: ['Currency Unit', 'Converted Value', 'Relative to USD'],
          rows: Object.keys(rates).map(c => {
            const val = (amt / rates[from]) * rates[c];
            return [c, `${val.toFixed(2)} ${c}`, `1 USD = ${rates[c]} ${c}`];
          })
        }
      };
    },
    formula: 'Converted Amount = (Amount / From Rate) x To Rate',
    formulaExplanation: 'Converts base inputs into an international USD anchor before outputting the final currency conversion.',
    example: {
      scenario: 'Converting 500 Euros (EUR) to British Pounds (GBP).',
      steps: [
        'EUR base rate = 0.92, GBP base rate = 0.78',
        'USD value = 500 / 0.92 = $543.48',
        'GBP value = $543.48 x 0.78 = 423.91 GBP'
      ],
      result: '500 Euros converts to 423.91 British Pounds.'
    },
    faqs: [
      { question: 'Are these conversion rates live?', answer: 'These rates represent real-world market reference values. For official bank wire clearances, always check live indices.' },
      { question: 'What is a spread in currency transactions?', answer: 'The spread is the markup margin physical exchanges charge above mid-market exchange rates to convert currencies.' }
    ],
    seoTitle: 'International Currency Converter Exchange | FinanceCalc',
    seoDescription: 'Convert global currencies instantly. Check foreign exchange rates for USD, EUR, GBP, CAD, AUD, JPY, INR, and SGD.'
  },
  {
    id: 'age',
    name: 'Age Calculator',
    slug: 'age-calculator',
    category: 'everyday',
    description: 'Calculate your exact age in years, months, days, hours, and find next birthday countdowns.',
    longDescription: 'Establish exact age breakdowns. Find how many total days, hours, or minutes you have lived and see precise countdown timers to your next birthday.',
    inputs: [
      { id: 'birth', name: 'Date of Birth', type: 'date', defaultValue: '1995-05-15' },
      { id: 'target', name: 'Target Assessment Date', type: 'date', defaultValue: '2026-07-12' }
    ],
    calculate: (inputs) => {
      const birthStr = String(inputs.birth);
      const targetStr = String(inputs.target);
      
      const birth = new Date(birthStr);
      const target = new Date(targetStr);
      
      if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
        return {
          summary: [{ label: 'Error', value: 'Invalid assessment dates provided.', color: '#DC2626' }]
        };
      }
      
      let years = target.getFullYear() - birth.getFullYear();
      let months = target.getMonth() - birth.getMonth();
      let days = target.getDate() - birth.getDate();
      
      if (days < 0) {
        months--;
        // Get number of days in the previous month of the target year
        const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      
      const msDiff = target.getTime() - birth.getTime();
      const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      const totalHours = totalDays * 24;
      
      // Calculate countdown to next birthday
      const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBday < target) {
        nextBday.setFullYear(target.getFullYear() + 1);
      }
      const bdayDiff = nextBday.getTime() - target.getTime();
      const bdayDays = Math.ceil(bdayDiff / (1000 * 60 * 60 * 24));
      
      return {
        summary: [
          { label: 'Exact Age', value: `${years} Years, ${months} Months, ${days} Days`, color: '#16A34A' },
          { label: 'Next Birthday Countdown', value: `${bdayDays} Days remaining`, color: '#2563EB' },
          { label: 'Total Days Lived', value: `${totalDays.toLocaleString()} Days`, color: '#D97706' },
          { label: 'Total Hours Lived', value: `${totalHours.toLocaleString()} Hours` }
        ],
        detailsTable: {
          headers: ['Metric Span', 'Total Value Equivalent'],
          rows: [
            ['Years, Months, Days', `${years} Years, ${months} Months, ${days} Days`],
            ['Total Weeks equivalent', `${totalWeeks} Weeks, ${remainingDays} Days`],
            ['Total Days equivalent', `${totalDays.toLocaleString()} Days`],
            ['Total Hours equivalent', `${totalHours.toLocaleString()} Hours`],
            ['Total Minutes equivalent', `${(totalDays * 24 * 60).toLocaleString()} Minutes`]
          ]
        }
      };
    },
    formula: 'Age = Target Assessment Date - Date of Birth; computed iteratively taking leap years and variable month spans into account.',
    formulaExplanation: 'Iterates through year, month, and day subtraction, borrowing days from previous calendar months as needed.',
    example: {
      scenario: 'Calculating exact age on July 12, 2026 for a child born on September 18, 2018.',
      steps: [
        'Birth = 2018-09-18, Target = 2026-07-12',
        'Difference in years = 2026 - 2018 = 8 years, adjusted to 7 years since birthday hasn\'t passed.',
        'Months remaining = 9 months, Days remaining = 24 days.'
      ],
      result: 'Child is exactly 7 Years, 9 Months, and 24 Days old. 68 days remain until their 8th birthday.'
    },
    faqs: [
      { question: 'Does this handle leap years?', answer: 'Yes! The calendar arithmetic automatically accounts for variable month lengths and leap year occurrences.' },
      { question: 'Can I check age at a historic future date?', answer: 'Yes, just change the assessment date input to any future point to see exactly how old you will be then.' }
    ],
    seoTitle: 'Exact Age & Chronology Birthday Calculator | FinanceCalc',
    seoDescription: 'Calculate your exact age in years, months, days, weeks, and hours. Get precise birthday countdown timers.'
  }
];
