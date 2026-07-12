import { CalculatorDef, AmortizationRow } from '../types';

function calculateEMI(principal: number, annualRate: number, years: number, extraPayment: number = 0): { emi: number; totalPayment: number; totalInterest: number; schedule: AmortizationRow[]; monthsSaved: number; interestSaved: number } {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  let emi = 0;
  if (r > 0) {
    emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else {
    emi = principal / n;
  }
  
  const originalTotalPayment = emi * n;
  const originalTotalInterest = originalTotalPayment - principal;
  
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPayment = 0;
  let actualMonths = 0;
  
  let yearlyPayment = 0;
  let yearlyPrincipal = 0;
  let yearlyInterest = 0;
  
  for (let i = 1; i <= n; i++) {
    if (balance <= 0) break;
    
    actualMonths++;
    const interest = balance * r;
    const rawPayment = emi + extraPayment;
    const payment = Math.min(rawPayment, balance + interest);
    const principalPaid = payment - interest;
    
    balance -= principalPaid;
    totalInterest += interest;
    totalPayment += payment;
    
    yearlyPayment += payment;
    yearlyPrincipal += principalPaid;
    yearlyInterest += interest;
    
    if (i % 12 === 0 || balance <= 0 || i === n) {
      schedule.push({
        period: Math.ceil(i / 12),
        payment: yearlyPayment,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        remainingBalance: Math.max(0, balance)
      });
      yearlyPayment = 0;
      yearlyPrincipal = 0;
      yearlyInterest = 0;
    }
  }
  
  const interestSaved = Math.max(0, originalTotalInterest - totalInterest);
  const monthsSaved = Math.max(0, n - actualMonths);
  
  return { emi: emi + extraPayment, totalPayment, totalInterest, schedule, monthsSaved, interestSaved };
}

export const loanCalculators: CalculatorDef[] = [
  {
    id: 'emi',
    name: 'EMI Calculator',
    slug: 'emi-calculator',
    category: 'loan',
    description: 'Calculate your monthly EMI (Equated Monthly Installment) for any loan.',
    longDescription: 'Plan your monthly budget by calculating Equated Monthly Installments (EMI) on any home, car, personal, or educational loan instantly. See a clear yearly amortization schedule and principal vs. interest breakdown.',
    inputs: [
      { id: 'principal', name: 'Loan Amount', type: 'number', min: 1000, max: 10000000, step: 1000, defaultValue: 100000, prefix: '$' },
      { id: 'rate', name: 'Interest Rate (Annual)', type: 'slider', min: 1, max: 30, step: 0.1, defaultValue: 8.5, unit: '%' },
      { id: 'years', name: 'Loan Tenure (Years)', type: 'slider', min: 1, max: 30, step: 1, defaultValue: 5, unit: 'Yrs' },
      { id: 'extraPayment', name: 'Extra Monthly Payment (Prepayment)', type: 'slider', min: 0, max: 10000, step: 100, defaultValue: 0, prefix: '$' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.principal);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      const extra = Number(inputs.extraPayment || 0);
      const { emi, totalPayment, totalInterest, schedule, monthsSaved, interestSaved } = calculateEMI(p, r, y, extra);
      
      const summary = [
        { label: 'Monthly Payment (with Prepayment)', value: `$${emi.toFixed(2)}`, color: '#2563EB' },
        { label: 'Principal Amount', value: `$${p.toLocaleString()}` },
        { label: 'Total Interest Payable', value: `$${totalInterest.toFixed(2)}`, color: '#D97706' },
        { label: 'Total Payment', value: `$${totalPayment.toFixed(2)}`, color: '#16A34A' }
      ];

      if (extra > 0) {
        summary.push(
          { label: 'Interest Saved via Prepayment', value: `$${interestSaved.toFixed(2)}`, color: '#10B981' },
          { label: 'Loan Tenure Shortened By', value: `${monthsSaved} Months`, color: '#8B5CF6' }
        );
      }
      
      return {
        summary,
        charts: {
          pie: [
            { label: 'Principal Amount', value: p, color: '#2563EB' },
            { label: 'Total Interest', value: totalInterest, color: '#D97706' }
          ],
          amortization: schedule
        }
      };
    },
    formula: 'EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]',
    formulaExplanation: 'Where P is the Principal loan amount, R is the monthly interest rate (Annual Rate / 12 / 100), and N is the loan tenure in number of months.',
    example: {
      scenario: 'Taking a Personal Loan of $50,000 for a duration of 3 years at an annual interest rate of 10%.',
      steps: [
        'Principal (P) = $50,000',
        'Monthly Rate (R) = 10% / 12 / 100 = 0.008333',
        'Tenure in Months (N) = 3 x 12 = 36 months',
        'EMI = [50000 x 0.008333 x (1.008333)^36] / [(1.008333)^36 - 1] = $1,613.36'
      ],
      result: 'Your monthly EMI is $1,613.36. Over 3 years, you will pay a total of $58,081.04, consisting of $50,000 principal and $8,081.04 in interest.'
    },
    faqs: [
      { question: 'What is an EMI?', answer: 'An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month.' },
      { question: 'How is interest calculated on loans?', answer: 'Most consumer loans use a reducing balance method where interest is computed on the outstanding loan balance at the end of each month.' }
    ],
    seoTitle: 'Loan EMI Calculator - Plan Your Monthly Installment Online',
    seoDescription: 'Calculate Equated Monthly Installment (EMI) for home loan, car loan, and personal loan with our easy-to-use free online EMI calculator.'
  },
  {
    id: 'bike-loan',
    name: 'Bike Loan Calculator',
    slug: 'bike-loan-calculator',
    category: 'loan',
    description: 'Calculate monthly EMIs and interest for purchase of a motorcycle or scooter.',
    longDescription: 'Get instant calculations on monthly payments for your dream motorcycle. Compare different interest rates and tenures to fit your budget securely.',
    inputs: [
      { id: 'principal', name: 'Bike On-road Price', type: 'number', min: 1000, max: 100000, step: 500, defaultValue: 8000, prefix: '$' },
      { id: 'downpayment', name: 'Down Payment', type: 'number', min: 0, max: 90000, step: 500, defaultValue: 1500, prefix: '$' },
      { id: 'rate', name: 'Interest Rate', type: 'slider', min: 3, max: 25, step: 0.1, defaultValue: 9.5, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 1, max: 5, step: 1, defaultValue: 3, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const price = Number(inputs.principal);
      const dp = Number(inputs.downpayment);
      const loanAmount = Math.max(0, price - dp);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      
      const { emi, totalPayment, totalInterest, schedule } = calculateEMI(loanAmount, r, y);
      
      return {
        summary: [
          { label: 'Monthly EMI', value: `$${emi.toFixed(2)}`, color: '#2563EB' },
          { label: 'Loan Amount Required', value: `$${loanAmount.toLocaleString()}` },
          { label: 'Total Interest Payable', value: `$${totalInterest.toFixed(2)}`, color: '#D97706' },
          { label: 'Total Out-of-Pocket Cost', value: `$${(dp + totalPayment).toFixed(2)}`, color: '#16A34A' }
        ],
        charts: {
          pie: [
            { label: 'Down Payment', value: dp, color: '#10B981' },
            { label: 'Loan Principal', value: loanAmount, color: '#2563EB' },
            { label: 'Total Interest', value: totalInterest, color: '#D97706' }
          ],
          amortization: schedule
        }
      };
    },
    formula: 'Loan Amount = Vehicle Cost - Down Payment; EMI = [Loan Amount x R x (1+R)^N] / [(1+R)^N - 1]',
    formulaExplanation: 'The required loan is computed first by subtracting the down payment from the vehicle price. EMI is then computed using standard compounding over the tenure.',
    example: {
      scenario: 'Buying a sports motorcycle for $12,000 with a $2,000 down payment at 8.9% interest for 3 years.',
      steps: [
        'Loan Amount = $12,000 - $2,000 = $10,000',
        'Tenure = 36 months, Monthly Rate = 8.9% / 12 / 100 = 0.007416',
        'EMI = [10000 x 0.007416 x (1.007416)^36] / [(1.007416)^36 - 1] = $317.55'
      ],
      result: 'Your monthly EMI is $317.55. Total interest paid is $1,431.80. Total price paid is $13,431.80.'
    },
    faqs: [
      { question: 'What is a typical down payment for a bike loan?', answer: 'Lenders usually expect 10% to 20% of the on-road price as a down payment, though paying more reduces your monthly burden and interest.' },
      { question: 'Can I pay off my bike loan early?', answer: 'Yes, most banks allow prepayment, although some charge foreclosure fees ranging from 1% to 3% of the outstanding principal.' }
    ],
    seoTitle: 'Two-Wheeler & Bike Loan EMI Calculator | FinanceCalc',
    seoDescription: 'Calculate monthly payments for motorcycle, bike or scooter loans. Adjust down payment, interest rate, and tenure to check financial viability.'
  },
  {
    id: 'car-loan',
    name: 'Car Loan Calculator',
    slug: 'car-loan-calculator',
    category: 'loan',
    description: 'Calculate monthly auto loan payments, taxes, and amortization timeline.',
    longDescription: 'Get full clarity on auto financing. Our car loan calculator computes precise monthly payments, total cost, and displays principal and interest splits.',
    inputs: [
      { id: 'principal', name: 'Car Price', type: 'number', min: 5000, max: 250000, step: 1000, defaultValue: 35000, prefix: '$' },
      { id: 'downpayment', name: 'Down Payment', type: 'number', min: 0, max: 200000, step: 1000, defaultValue: 5000, prefix: '$' },
      { id: 'rate', name: 'Interest Rate', type: 'slider', min: 1, max: 20, step: 0.1, defaultValue: 6.2, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 1, max: 7, step: 1, defaultValue: 5, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const price = Number(inputs.principal);
      const dp = Number(inputs.downpayment);
      const loanAmount = Math.max(0, price - dp);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      
      const { emi, totalPayment, totalInterest, schedule } = calculateEMI(loanAmount, r, y);
      
      return {
        summary: [
          { label: 'Monthly Payment', value: `$${emi.toFixed(2)}`, color: '#2563EB' },
          { label: 'Loan Principal', value: `$${loanAmount.toLocaleString()}` },
          { label: 'Total Interest Paid', value: `$${totalInterest.toFixed(2)}`, color: '#D97706' },
          { label: 'Total Car Cost', value: `$${(dp + totalPayment).toFixed(2)}`, color: '#16A34A' }
        ],
        charts: {
          pie: [
            { label: 'Down Payment', value: dp, color: '#10B981' },
            { label: 'Loan Principal', value: loanAmount, color: '#2563EB' },
            { label: 'Interest Cost', value: totalInterest, color: '#D97706' }
          ],
          amortization: schedule
        }
      };
    },
    formula: 'Car Loan Amount = Price - Down Payment; EMI Formula applied on loan amount.',
    formulaExplanation: 'Computes monthly EMIs using standard reducing balance interest over a typical 1 to 7 year automotive term.',
    example: {
      scenario: 'Buying a standard SUV for $30,000, offering $5,000 down, financed at 5.5% for 5 years.',
      steps: [
        'Financed Amount = $25,000',
        'Tenure = 60 months, Rate = 5.5% / 12 = 0.4583% monthly',
        'EMI = [25000 x 0.004583 x (1.004583)^60] / [(1.004583)^60 - 1] = $477.53'
      ],
      result: 'Monthly cost is $477.53. Total cost of loan is $28,651.80, with interest of $3,651.80.'
    },
    faqs: [
      { question: 'What car loan tenure is best?', answer: 'Shorter terms (3-4 years) save significant interest, but longer terms (5-7 years) offer lower, more manageable monthly payments.' },
      { question: 'Does a car trade-in act as a down payment?', answer: 'Yes! Net trade-in value (value of car minus any remaining loan on it) adds directly to your down payment, lowering the loan required.' }
    ],
    seoTitle: 'Auto & Car Loan Calculator - FinanceCalc',
    seoDescription: 'Find your monthly car payments using our free auto loan calculator. Enter vehicle price, interest, and term to see total car cost.'
  },
  {
    id: 'home-loan',
    name: 'Home Loan Calculator',
    slug: 'home-loan-calculator',
    category: 'loan',
    description: 'Estimate your home mortgage payments, principal schedule, and tax options.',
    longDescription: 'Explore home financing options with detail. Calculate monthly payments, complete loan schedules, and evaluate the effect of interest rates over a 15-30 year span.',
    inputs: [
      { id: 'principal', name: 'Property Value', type: 'number', min: 10000, max: 10000000, step: 10000, defaultValue: 350000, prefix: '$' },
      { id: 'downpayment', name: 'Down Payment', type: 'number', min: 0, max: 9000000, step: 5000, defaultValue: 70000, prefix: '$' },
      { id: 'rate', name: 'Interest Rate', type: 'slider', min: 1, max: 15, step: 0.1, defaultValue: 6.5, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 5, max: 30, step: 5, defaultValue: 25, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const price = Number(inputs.principal);
      const dp = Number(inputs.downpayment);
      const loanAmount = Math.max(0, price - dp);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      
      const { emi, totalPayment, totalInterest, schedule } = calculateEMI(loanAmount, r, y);
      
      return {
        summary: [
          { label: 'Monthly Payment', value: `$${emi.toFixed(2)}`, color: '#2563EB' },
          { label: 'Loan Principal', value: `$${loanAmount.toLocaleString()}` },
          { label: 'Total Interest Paid', value: `$${totalInterest.toFixed(2)}`, color: '#D97706' },
          { label: 'Total Lifetime Cost', value: `$${(dp + totalPayment).toFixed(2)}`, color: '#16A34A' }
        ],
        charts: {
          pie: [
            { label: 'Down Payment', value: dp, color: '#10B981' },
            { label: 'Principal Financed', value: loanAmount, color: '#2563EB' },
            { label: 'Interest Cost', value: totalInterest, color: '#D97706' }
          ],
          amortization: schedule
        }
      };
    },
    formula: 'Mortgage EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]',
    formulaExplanation: 'Computes mortgage debt service. Highly visual table breaks down how equity slowly builds in the early years of your home ownership.',
    example: {
      scenario: 'Purchasing a house worth $400,000, offering a 20% ($80,000) down payment, with a 6.0% interest rate for 30 years.',
      steps: [
        'Financed Amount = $320,000',
        'Tenure = 360 months, Monthly Rate = 0.5%',
        'EMI = [320000 x 0.005 x (1.005)^360] / [(1.005)^360 - 1] = $1,918.56'
      ],
      result: 'Monthly principal & interest payment is $1,918.56. Over 30 years, total interest is $370,681.60.'
    },
    faqs: [
      { question: 'What is the 28/36 rule in home buying?', answer: 'It is a guidelines suggesting your housing costs should not exceed 28% of gross monthly income, and total debt payments should not exceed 36%.' },
      { question: 'Is it better to pay off a mortgage early?', answer: 'Yes, adding even a small extra amount monthly reduces the principal faster, shortening the term and saving thousands in compound interest.' }
    ],
    seoTitle: 'Home Loan & Mortgage Calculator | FinanceCalc',
    seoDescription: 'Plan your home purchase using our detailed mortgage calculator. Calculate monthly house payments, interest schedules, and prepayment options.'
  },
  {
    id: 'personal-loan',
    name: 'Personal Loan Calculator',
    slug: 'personal-loan-calculator',
    category: 'loan',
    description: 'Find interest and monthly EMIs for personal expenses, medical costs, or wedding loans.',
    longDescription: 'Easily estimate costs for personal loans. Evaluate loan rates, find comfortable terms, and avoid hidden overpayment fees.',
    inputs: [
      { id: 'principal', name: 'Required Loan', type: 'number', min: 1000, max: 150000, step: 1000, defaultValue: 20000, prefix: '$' },
      { id: 'rate', name: 'Interest Rate', type: 'slider', min: 5, max: 36, step: 0.1, defaultValue: 11.5, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 1, max: 7, step: 1, defaultValue: 3, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.principal);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      
      const { emi, totalPayment, totalInterest, schedule } = calculateEMI(p, r, y);
      
      return {
        summary: [
          { label: 'Monthly Payment', value: `$${emi.toFixed(2)}`, color: '#2563EB' },
          { label: 'Loan Principal', value: `$${p.toLocaleString()}` },
          { label: 'Total Interest Payable', value: `$${totalInterest.toFixed(2)}`, color: '#D97706' },
          { label: 'Total Repayment Cost', value: `$${totalPayment.toFixed(2)}`, color: '#16A34A' }
        ],
        charts: {
          pie: [
            { label: 'Principal', value: p, color: '#2563EB' },
            { label: 'Interest', value: totalInterest, color: '#D97706' }
          ],
          amortization: schedule
        }
      };
    },
    formula: 'Standard reducing-balance EMI equation.',
    formulaExplanation: 'Since personal loans are usually unsecured, they feature slightly higher rates. The formula demonstrates the importance of a shorter repayment plan.',
    example: {
      scenario: 'Taking a consolidation personal loan of $15,000 at 12% interest for 3 years.',
      steps: [
        'Principal = $15,000, Months = 36',
        'Monthly Rate = 1%',
        'EMI = [15000 x 0.01 x (1.01)^36] / [(1.01)^36 - 1] = $498.21'
      ],
      result: 'Monthly EMI is $498.21. Total repayment is $17,935.56, which contains $2,935.56 in interest.'
    },
    faqs: [
      { question: 'What factors determine my personal loan rate?', answer: 'Your credit score, annual income, employment stability, and debt-to-income ratio (DTI) are the principal factors.' },
      { question: 'Are there processing fees on personal loans?', answer: 'Yes, lenders typically charge a processing fee of 1% to 3% of the loan amount, which is deducted upfront from your disbursed amount.' }
    ],
    seoTitle: 'Personal Loan EMI Calculator | FinanceCalc',
    seoDescription: 'Calculate EMIs and interest charges on personal loans. Enter your borrowing requirements to see detailed amortization charts instantly.'
  },
  {
    id: 'education-loan',
    name: 'Education & Student Loan Calculator',
    slug: 'education-loan-calculator',
    category: 'loan',
    description: 'Calculate student loan payments, including interest accumulated during moratorium.',
    longDescription: 'Manage college costs responsibly. This calculator handles interest accumulating during study periods (moratorium) to give students a realistic financial payment timeline.',
    inputs: [
      { id: 'principal', name: 'Education Loan Amount', type: 'number', min: 5000, max: 500000, step: 5000, defaultValue: 40000, prefix: '$' },
      { id: 'rate', name: 'Interest Rate', type: 'slider', min: 3, max: 18, step: 0.1, defaultValue: 8.2, unit: '%' },
      { id: 'years', name: 'Repayment Period (Years)', type: 'slider', min: 1, max: 15, step: 1, defaultValue: 10, unit: 'Yrs' },
      { id: 'moratorium', name: 'Study/Moratorium (Years)', type: 'slider', min: 0, max: 5, step: 1, defaultValue: 4, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.principal);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      const m = Number(inputs.moratorium);
      
      // Calculate simple interest accrued during moratorium
      const interestDuringMoratorium = p * (r / 100) * m;
      const combinedPrincipal = p + interestDuringMoratorium;
      
      const { emi, totalPayment, totalInterest, schedule } = calculateEMI(combinedPrincipal, r, y);
      
      return {
        summary: [
          { label: 'Post-College Monthly EMI', value: `$${emi.toFixed(2)}`, color: '#2563EB' },
          { label: 'Initial Principal', value: `$${p.toLocaleString()}` },
          { label: 'Accrued Study Interest', value: `$${interestDuringMoratorium.toFixed(2)}`, color: '#D97706' },
          { label: 'Total Repayment Cost', value: `$${totalPayment.toFixed(2)}`, color: '#16A34A' }
        ],
        charts: {
          pie: [
            { label: 'Initial Principal', value: p, color: '#2563EB' },
            { label: 'Study Period Interest', value: interestDuringMoratorium, color: '#F59E0B' },
            { label: 'Repayment Interest', value: totalInterest - interestDuringMoratorium, color: '#EF4444' }
          ],
          amortization: schedule
        }
      };
    },
    formula: 'Accrued Interest = Principal x Rate x Moratorium; Adjusted Principal = Principal + Accrued Interest; Standard EMI formula then applied.',
    formulaExplanation: 'Lenders charge interest during college years, which is usually added to the principal (capitalized) before regular repayments start.',
    example: {
      scenario: 'A student borrows $30,000 at 8% annual interest with a 4-year study moratorium and 10-year repayment period.',
      steps: [
        'Interest accumulated in college = $30,000 x 8% x 4 years = $9,600',
        'New base principal at graduation = $30,000 + $9,600 = $39,600',
        'Tenure = 120 months, Monthly rate = 0.667%',
        'Post-college EMI = $480.46'
      ],
      result: 'Monthly repayment after college is $480.46. Total amount returned is $57,655.20.'
    },
    faqs: [
      { question: 'What is a loan moratorium period?', answer: 'A moratorium or grace period is a duration (such as study years + 6 months) during which the student does not have to make repayments.' },
      { question: 'Can I pay interest during college to save money?', answer: 'Absolutely! Paying simple interest during your studies stops it from compounding, saving substantial amounts in the long run.' }
    ],
    seoTitle: 'Student & Education Loan Calculator | FinanceCalc',
    seoDescription: 'Find your monthly student loan payments. Includes a customizable study period moratorium selector to handle deferred interest compounding.'
  },
  {
    id: 'loan-eligibility',
    name: 'Loan Eligibility Calculator',
    slug: 'loan-eligibility-calculator',
    category: 'loan',
    description: 'Calculate the maximum loan principal amount you can borrow based on income.',
    longDescription: 'Ensure your next application is approved. This calculator estimates your borrowing capacity based on monthly income, current debts, and lender guidelines.',
    inputs: [
      { id: 'income', name: 'Gross Monthly Income', type: 'number', min: 1000, max: 100000, step: 500, defaultValue: 6000, prefix: '$' },
      { id: 'existingEmis', name: 'Existing EMIs / Debts', type: 'number', min: 0, max: 50000, step: 100, defaultValue: 500, prefix: '$' },
      { id: 'foir', name: 'Income Limit Ratio (FOIR)', type: 'slider', min: 30, max: 70, step: 5, defaultValue: 50, unit: '%' },
      { id: 'rate', name: 'Expected Loan Rate', type: 'slider', min: 3, max: 20, step: 0.1, defaultValue: 8.0, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 1, max: 30, step: 1, defaultValue: 15, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const income = Number(inputs.income);
      const existing = Number(inputs.existingEmis);
      const foirPct = Number(inputs.foir);
      const r = Number(inputs.rate) / 12 / 100;
      const n = Number(inputs.years) * 12;
      
      const maxAllowedEMI = income * (foirPct / 100);
      const eligibleEMI = Math.max(0, maxAllowedEMI - existing);
      
      let eligiblePrincipal = 0;
      if (r > 0) {
        eligiblePrincipal = (eligibleEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
      } else {
        eligiblePrincipal = eligibleEMI * n;
      }
      
      return {
        summary: [
          { label: 'Eligible Loan Principal', value: `$${Math.floor(eligiblePrincipal).toLocaleString()}`, color: '#16A34A' },
          { label: 'Max Monthly Debt Limit', value: `$${maxAllowedEMI.toFixed(2)}` },
          { label: 'Available Monthly EMI Room', value: `$${eligibleEMI.toFixed(2)}`, color: '#2563EB' }
        ],
        charts: {
          pie: [
            { label: 'Available EMI Cap', value: eligibleEMI, color: '#10B981' },
            { label: 'Existing Debts', value: existing, color: '#EF4444' },
            { label: 'Discretionary Income', value: Math.max(0, income - maxAllowedEMI), color: '#E5E7EB' }
          ]
        }
      };
    },
    formula: 'Eligible EMI = (Income x FOIR%) - Existing Obligations; Principal = [EMI x ((1+R)^N - 1)] / [R x (1+R)^N]',
    formulaExplanation: 'Lenders evaluate Fixed Obligation to Income Ratio (FOIR) to determine what percent of income can reasonably pay for loan obligations.',
    example: {
      scenario: 'An applicant earns $8,000 monthly, pays $800 in active debts, seeking a mortgage at 7% for 20 years with 50% max FOIR.',
      steps: [
        'Max Monthly Debt limit = $8,000 x 50% = $4,000',
        'Available EMI Room = $4,000 - $800 existing = $3,200',
        'Max Loan Principal = $3,200 for 240 months at 0.5833% rate = $412,854'
      ],
      result: 'The applicant is eligible to borrow up to $412,854 with an EMI of $3,200.'
    },
    faqs: [
      { question: 'What is FOIR in loan evaluation?', answer: 'Fixed Obligation to Income Ratio (FOIR) measures the proportion of monthly income that goes toward paying debts. Lenders keep this under 40%-50% for safety.' },
      { question: 'How can I increase my eligible loan amount?', answer: 'You can co-sign with a working spouse, clear your existing small debts, or request a longer tenure which reduces monthly EMI requirements.' }
    ],
    seoTitle: 'Loan Eligibility Calculator - Check Borrowing Limit | FinanceCalc',
    seoDescription: 'Find your loan borrowing capacity online. Our loan eligibility calculator estimates max principal based on monthly salary and commitments.'
  },
  {
    id: 'loan-comparison',
    name: 'Loan Comparison Calculator',
    slug: 'loan-comparison-calculator',
    category: 'loan',
    description: 'Compare two loan offers side-by-side to find the most cost-effective deal.',
    longDescription: 'Compare principal amounts, interest rates, or tenures of two distinct financing offers instantly. Find exactly which loan saves you the most money over time.',
    inputs: [
      { id: 'principal', name: 'Loan Amount (Principal)', type: 'number', min: 1000, max: 5000000, step: 5000, defaultValue: 150000, prefix: '$' },
      { id: 'rateA', name: 'Offer A: Interest Rate', type: 'slider', min: 1, max: 25, step: 0.1, defaultValue: 7.2, unit: '%' },
      { id: 'yearsA', name: 'Offer A: Tenure (Years)', type: 'slider', min: 1, max: 30, step: 1, defaultValue: 15, unit: 'Yrs' },
      { id: 'rateB', name: 'Offer B: Interest Rate', type: 'slider', min: 1, max: 25, step: 0.1, defaultValue: 6.8, unit: '%' },
      { id: 'yearsB', name: 'Offer B: Tenure (Years)', type: 'slider', min: 1, max: 30, step: 1, defaultValue: 20, unit: 'Yrs' }
    ],
    calculate: (inputs) => {
      const p = Number(inputs.principal);
      const rA = Number(inputs.rateA);
      const yA = Number(inputs.yearsA);
      const rB = Number(inputs.rateB);
      const yB = Number(inputs.yearsB);
      
      const loanA = calculateEMI(p, rA, yA);
      const loanB = calculateEMI(p, rB, yB);
      
      const emiDiff = Math.abs(loanA.emi - loanB.emi);
      const interestDiff = Math.abs(loanA.totalInterest - loanB.totalInterest);
      
      const lowerInterestOffer = loanA.totalInterest < loanB.totalInterest ? 'Offer A' : 'Offer B';
      const lowerEMIOffer = loanA.emi < loanB.emi ? 'Offer A' : 'Offer B';
      
      return {
        summary: [
          { label: 'Offer A Monthly EMI', value: `$${loanA.emi.toFixed(2)}`, color: '#2563EB' },
          { label: 'Offer B Monthly EMI', value: `$${loanB.emi.toFixed(2)}`, color: '#1D4ED8' },
          { label: 'Difference in Interest', value: `$${interestDiff.toFixed(2)} (Saves in ${lowerInterestOffer})`, color: '#16A34A' },
          { label: 'Lowest EMI Plan', value: `${lowerEMIOffer} ($${emiDiff.toFixed(2)} lower)`, color: '#10B981' }
        ],
        detailsTable: {
          headers: ['Metric', 'Offer A', 'Offer B', 'Variance'],
          rows: [
            ['Loan Amount', `$${p.toLocaleString()}`, `$${p.toLocaleString()}`, '$0'],
            ['Interest Rate', `${rA}%`, `${rB}%`, `${(rA - rB).toFixed(2)}%`],
            ['Tenure', `${yA} Years`, `${yB} Years`, `${yA - yB} Years`],
            ['Monthly EMI', `$${loanA.emi.toFixed(2)}`, `$${loanB.emi.toFixed(2)}`, `$${emiDiff.toFixed(2)}`],
            ['Total Interest Paid', `$${loanA.totalInterest.toFixed(2)}`, `$${loanB.totalInterest.toFixed(2)}`, `$${interestDiff.toFixed(2)}`],
            ['Total Lifetime Payment', `$${loanA.totalPayment.toFixed(2)}`, `$${loanB.totalPayment.toFixed(2)}`, `$${interestDiff.toFixed(2)}`]
          ]
        }
      };
    },
    formula: 'EMI calculations are done independently for Loan A and Loan B; metrics are then contrasted side-by-side.',
    formulaExplanation: 'Highlights the tension between lower monthly payments (longer terms) vs. lower total lifetime interest costs (shorter terms).',
    example: {
      scenario: 'Comparing a $100,000 loan under Offer A (7% for 15 years) vs. Offer B (6.5% for 20 years).',
      steps: [
        'Offer A Monthly EMI = $898.83, Total Interest = $61,789.09',
        'Offer B Monthly EMI = $745.57, Total Interest = $78,937.28',
        'EMI savings = Offer B saves $153.26 monthly',
        'Interest savings = Offer A saves $17,148.19 in total lifetime interest'
      ],
      result: 'If monthly cash flow is tight, Offer B is preferred. If you want to build equity fast and save money, Offer A is superior.'
    },
    faqs: [
      { question: 'Why does a lower rate sometimes cost more in total?', answer: 'If the lower rate has a longer tenure, you pay interest over more months, which can elevate the total interest above a high-rate, short-tenure loan.' },
      { question: 'What metrics should I focus on when comparing loans?', answer: 'Check both the Annual Percentage Rate (APR), which includes fees, and the overall lifetime interest paid.' }
    ],
    seoTitle: 'Loan Comparison Calculator - Side-by-Side Analysis | FinanceCalc',
    seoDescription: 'Compare interest rates, monthly EMIs, and overall interest payments of two loans side-by-side using this free tool.'
  },
  {
    id: 'down-payment',
    name: 'Down Payment Calculator',
    slug: 'down-payment-calculator',
    category: 'loan',
    description: 'Calculate how much down payment to make and plan your savings timeline.',
    longDescription: 'Establish how much down payment you should save for a home or vehicle. Set a realistic target and map out monthly savings needed to reach your goal.',
    inputs: [
      { id: 'price', name: 'Purchase Price', type: 'number', min: 5000, max: 2000000, step: 5000, defaultValue: 300000, prefix: '$' },
      { id: 'dpPct', name: 'Desired Down Payment (%)', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 20, unit: '%' },
      { id: 'saved', name: 'Already Saved Amount', type: 'number', min: 0, max: 500000, step: 1000, defaultValue: 15000, prefix: '$' },
      { id: 'months', name: 'Target Savings Period (Months)', type: 'slider', min: 1, max: 60, step: 1, defaultValue: 24, unit: 'Mths' }
    ],
    calculate: (inputs) => {
      const price = Number(inputs.price);
      const pct = Number(inputs.dpPct);
      const saved = Number(inputs.saved);
      const m = Number(inputs.months);
      
      const totalRequired = price * (pct / 100);
      const remainingToSave = Math.max(0, totalRequired - saved);
      const monthlySavingsRequired = remainingToSave / m;
      const loanRequired = price - totalRequired;
      
      return {
        summary: [
          { label: 'Total Down Payment Goal', value: `$${totalRequired.toLocaleString()}`, color: '#2563EB' },
          { label: 'Remaining Savings Needed', value: `$${remainingToSave.toLocaleString()}`, color: '#D97706' },
          { label: 'Required Monthly Savings', value: `$${monthlySavingsRequired.toFixed(2)}`, color: '#16A34A' },
          { label: 'Estimated Loan Amount', value: `$${loanRequired.toLocaleString()}` }
        ],
        charts: {
          pie: [
            { label: 'Already Saved', value: saved, color: '#10B981' },
            { label: 'Needed Savings', value: remainingToSave, color: '#D97706' },
            { label: 'Loan Financed Portion', value: loanRequired, color: '#E5E7EB' }
          ]
        }
      };
    },
    formula: 'Target Down Payment = Purchase Price x Target%; Remaining = Target Down Payment - Savings; Monthly Savings = Remaining / Months.',
    formulaExplanation: 'Determines the upfront down payment required and estimates the systematic monthly savings speed needed to reach the goal.',
    example: {
      scenario: 'Planning a 20% down payment on a $250,000 house, having already saved $10,000, with a 2-year goal (24 months).',
      steps: [
        'Total Down Payment required = $250,000 x 20% = $50,000',
        'Remaining needed = $50,000 - $10,000 saved = $40,000',
        'Monthly Savings = $40,000 / 24 months = $1,666.67'
      ],
      result: 'You need to save $1,666.67 every month for 24 months to reach your $50,000 down payment goal.'
    },
    faqs: [
      { question: 'Do I have to make a 20% down payment on a home?', answer: 'No, many conventional loans allow as little as 3% to 5%, and FHA loans require 3.5%. However, 20% avoids Private Mortgage Insurance (PMI).' },
      { question: 'How can I accelerate my down payment savings?', answer: 'You can allocate tax refunds, high-yield savings interest, or automate transfers to high-yield cash sweep accounts.' }
    ],
    seoTitle: 'Down Payment Savings Goal Calculator | FinanceCalc',
    seoDescription: 'Plan your purchase deposit down payment. Easily calculate the target monthly savings needed to acquire a home or vehicle.'
  },
  {
    id: 'mortgage',
    name: 'Mortgage Calculator (PITI)',
    slug: 'mortgage-calculator',
    category: 'loan',
    description: 'Calculate comprehensive mortgage payments including principal, interest, taxes, and insurance.',
    longDescription: 'Go beyond the basic loan calculations. Our full mortgage calculator integrates real-world property tax rates, home insurance, and Private Mortgage Insurance (PMI) for complete cost transparency.',
    inputs: [
      { id: 'price', name: 'Home Purchase Price', type: 'number', min: 10000, max: 10000000, step: 10000, defaultValue: 400000, prefix: '$' },
      { id: 'dpPct', name: 'Down Payment (%)', type: 'slider', min: 0, max: 50, step: 1, defaultValue: 20, unit: '%' },
      { id: 'rate', name: 'Interest Rate', type: 'slider', min: 1, max: 15, step: 0.1, defaultValue: 6.8, unit: '%' },
      { id: 'years', name: 'Tenure (Years)', type: 'slider', min: 10, max: 30, step: 5, defaultValue: 30, unit: 'Yrs' },
      { id: 'taxRate', name: 'Annual Property Tax Rate', type: 'slider', min: 0, max: 4, step: 0.05, defaultValue: 1.2, unit: '%' },
      { id: 'insurance', name: 'Annual Home Insurance', type: 'number', min: 0, max: 10000, step: 100, defaultValue: 1500, prefix: '$' }
    ],
    calculate: (inputs) => {
      const price = Number(inputs.price);
      const dpPct = Number(inputs.dpPct);
      const r = Number(inputs.rate);
      const y = Number(inputs.years);
      const taxRate = Number(inputs.taxRate);
      const annualInsurance = Number(inputs.insurance);
      
      const dpAmount = price * (dpPct / 100);
      const loanAmount = Math.max(0, price - dpAmount);
      
      // EMI (Principal + Interest)
      const { emi: baseEMI, totalInterest, schedule } = calculateEMI(loanAmount, r, y);
      
      // Property Tax (monthly)
      const monthlyTax = (price * (taxRate / 100)) / 12;
      
      // Home Insurance (monthly)
      const monthlyInsurance = annualInsurance / 12;
      
      // PMI (monthly) - usually applies if down payment is less than 20%
      const pmiRate = dpPct < 20 ? 0.7 : 0.0; // standard 0.7% annual on loan amount
      const monthlyPMI = dpPct < 20 ? (loanAmount * (pmiRate / 100)) / 12 : 0;
      
      const totalMonthly = baseEMI + monthlyTax + monthlyInsurance + monthlyPMI;
      
      return {
        summary: [
          { label: 'Total Monthly (PITI)', value: `$${totalMonthly.toFixed(2)}`, color: '#2563EB' },
          { label: 'Principal & Interest', value: `$${baseEMI.toFixed(2)}` },
          { label: 'Monthly Property Tax', value: `$${monthlyTax.toFixed(2)}`, color: '#D97706' },
          { label: 'Monthly Insurance & PMI', value: `$${(monthlyInsurance + monthlyPMI).toFixed(2)}`, color: '#EF4444' }
        ],
        charts: {
          pie: [
            { label: 'Principal & Interest', value: baseEMI, color: '#2563EB' },
            { label: 'Property Tax', value: monthlyTax, color: '#D97706' },
            { label: 'Home Insurance', value: monthlyInsurance, color: '#10B981' },
            { label: 'PMI', value: monthlyPMI, color: '#EF4444' }
          ],
          amortization: schedule
        }
      };
    },
    formula: 'Monthly Mortgage Payment (PITI) = Principal & Interest (EMI) + Monthly Tax + Monthly Insurance + Monthly PMI',
    formulaExplanation: 'Lenders check the complete PITI (Principal, Interest, Taxes, Insurance) budget to evaluate if you can afford a mortgage.',
    example: {
      scenario: 'Buying a $500,000 home with a 10% ($50,000) down payment, a 6.5% interest rate for 30 years, 1.2% tax, and $1,200 insurance.',
      steps: [
        'Financed Amount = $450,000',
        'Monthly Principal + Interest (EMI) = $2,844.31',
        'Property Tax = ($500,000 x 1.2%) / 12 = $500.00',
        'Home Insurance = $1,200 / 12 = $100.00',
        'PMI (down payment < 20%) = ($450,000 x 0.7%) / 12 = $262.50',
        'Total Monthly = $2,844.31 + $500 + $100 + $262.50 = $3,706.81'
      ],
      result: 'The total monthly out-of-pocket mortgage payment is $3,706.81.'
    },
    faqs: [
      { question: 'What is PITI?', answer: 'PITI stands for Principal, Interest, Taxes, and Insurance. These are the four basic components of a monthly mortgage payment.' },
      { question: 'How can I stop paying PMI?', answer: 'Private Mortgage Insurance (PMI) is automatically removed once your loan balance reaches 78% of the original purchase price or you acquire 20% equity.' }
    ],
    seoTitle: 'Mortgage Calculator with Taxes and Insurance (PITI) | FinanceCalc',
    seoDescription: 'Calculate full housing mortgage costs. Enter home values, rates, taxes, insurance, and PMI to view your true monthly mortgage expenses.'
  }
];
