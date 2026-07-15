import { CalculatorDef } from '../types';

interface EduContent {
  author: string;
  authorRole: string;
  lastUpdated: string;
  readingTime: string;
  introduction: string;
  whenToUse: string[];
  benefits: string[];
  limitations: string[];
  variables: { name: string; value: string; explanation: string }[];
  stepByStep: string[];
  mistakes: string[];
  tips: string[];
  disclaimer: string;
}

export function getEduContent(calc: CalculatorDef, inputs: Record<string, any>): EduContent {
  const categoryName = calc.category === 'loan' ? 'Loans' 
    : calc.category === 'investment' ? 'Investing' 
    : calc.category === 'tax' ? 'Taxes' 
    : calc.category === 'savings' ? 'Savings' 
    : 'Personal Finance';

  // Format inputs as readable values
  const variablesList = calc.inputs.map(input => {
    const rawVal = inputs[input.id] ?? input.defaultValue;
    let formattedVal = String(rawVal);
    if (input.prefix) formattedVal = input.prefix + Number(rawVal).toLocaleString();
    if (input.unit) formattedVal = formattedVal + ' ' + input.unit;

    // Custom variable explanations based on input name
    let explanation = `The selected value representing the active parameter for this calculation.`;
    if (input.id === 'principal' || input.id === 'investment' || input.id === 'balance') {
      explanation = `The core starting capital or total amount of money borrowed or invested before accounting for compounding interest, fees, or dividends.`;
    } else if (input.id === 'rate' || input.id === 'apr' || input.id === 'currentRate' || input.id === 'newRate') {
      explanation = `The annual nominal percentage interest rate charged by lenders or earned on investments, typically compounded on a monthly frequency.`;
    } else if (input.id === 'years' || input.id === 'term' || input.id === 'currentTerm' || input.id === 'newTerm') {
      explanation = `The overall duration of the agreement or systematic investment timeframe, expressing how many calendar years interest is allowed to compound.`;
    } else if (input.id === 'extraPayment' || input.id === 'monthlyContribution') {
      explanation = `An additional monthly voluntary contribution added to accelerate principal pay-down or boost your long-term compounding nest egg growth.`;
    }

    return {
      name: input.name,
      value: formattedVal,
      explanation
    };
  });

  // Category-specific fallback information for ultimate data-driven scaling
  let intro = `The ${calc.name} is a comprehensive financial planning tool engineered to provide transparent mathematical projections. Proper utilization of this tool empowers you to audit interest costs, plan long-term milestones, and optimize cash flow allocations before engaging in formal banking negotiations.`;
  let whenToUse: string[] = [];
  let benefits: string[] = [];
  let limitations: string[] = [];
  let mistakes: string[] = [];
  let tips: string[] = [];

  if (calc.id === 'emi') {
    intro = `Our free online ${calc.name} provides a robust, mathematical breakdown of your loan repayment schedule. By inputting your principal, rate, and term, this term loan calculator reveals how much of your monthly EMI goes toward the actual principal and how much covers the interest on a reducing balance basis.`;
    whenToUse = [
      `Before visiting a bank to lock down personal loan agreements, to calculate your EMI independently.`,
      `When comparing multiple loan interest rates to see the true difference in your monthly payment.`,
      `To calculate how much money you can save on interest by prepaying a fixed extra amount monthly.`,
      `When you need a precise loan schedule calculator to forecast a personal loan reducing balance over time.`
    ];
    benefits = [
      `Acts as a dedicated loan principal and interest calculator to protect you from hidden bank margins.`,
      `Illustrates the powerful impact of prepayments on your loan repayment schedule.`,
      `Calculates exact loan EMI monthly payment without requiring sensitive information.`,
      `Features high-contrast PDF ledger summaries ready to print for financial planning.`
    ];
    limitations = [
      `Does not account for variable interest rate adjustments unless locked into a fixed-rate structure.`,
      `Fails to capture dynamic credit score changes which can alter qualification criteria.`,
      `Does not automatically integrate processing fees or origination charges into the base calculation.`
    ];
    mistakes = [
      `Focusing only on a low monthly payment calculator while ignoring a highly extended loan term which increases total interest.`,
      `Failing to count processing fees, origination charges, and document fees into the loan's true APR.`,
      `Assuming bank interest rates are non-negotiable; always use these figures to push for lower quotes.`
    ];
    tips = [
      `Aim to make bi-weekly payments when possible; this adds one extra full payment per year, cutting years off mortgages.`,
      `Always keep debt-to-income (DTI) ratios under 36% to remain highly liquid and avoid technical default risks.`,
      `Use our loan calculator online before accepting any bank offer to verify the actual interest cost.`
    ];
  } else if (calc.category === 'loan') {
    intro = `The ${calc.name} offers borrowers a reliable, mathematical audit of interest liabilities, monthly payments, and amortization schedules. Whether preparing for a home mortgage, automobile lease, or personal credit line, running your values through our calculator ensures total transparency of loan dynamics.`;
    whenToUse = [
      `Before visiting a bank or dealership to lock down borrowing agreements.`,
      `When comparing multiple loan quotes to see the true difference in effective APR.`,
      `To calculate how much money you can save by prepaying a fixed extra amount monthly.`,
      `When evaluating if refinancing high-rate liabilities yields net savings after closing costs.`
    ];
    benefits = [
      `Protects you from premium rate markups by giving you the precise amortization math.`,
      `Illustrates the powerful impact of prepayments on shortening loan terms.`,
      `Provides a clear split of how much of each payment goes to principal vs interest over time.`,
      `Features high-contrast PDF ledger summaries ready to print for financial planning.`
    ];
    limitations = [
      `Does not account for variable interest rate adjustments unless locked into a fixed-rate structure.`,
      `Fails to capture dynamic credit score changes which can alter qualification criteria.`,
      `Does not automatically integrate localized escrow accounts, title insurance, or municipal property taxes.`
    ];
    mistakes = [
      `Focusing only on a low monthly payment while ignoring a highly extended loan term which increases total interest.`,
      `Failing to count processing fees, origination charges, and document fees into the loan's true APR.`,
      `Assuming bank interest rates are non-negotiable; always use these figures to push for lower quotes.`
    ];
    tips = [
      `Aim to make bi-weekly payments when possible; this adds one extra full payment per year, cutting years off mortgages.`,
      `Always keep debt-to-income (DTI) ratios under 36% to remain highly liquid and avoid technical default risks.`,
      `If interest rates drop by 1% or more, run the Refinance Calculator to see if closing costs break even quickly.`
    ];
  } else if (calc.category === 'investment' || calc.category === 'savings') {
    intro = `The ${calc.name} is designed to map out compound wealth generation, capital appreciation, and systematic retirement drawings. By projecting current deposits against expected market growth, you can visually track your compounding momentum across standard index portfolios.`;
    whenToUse = [
      `When establishing monthly retirement or college savings systematic goals.`,
      `To evaluate the compound growth trajectory of mutual fund and index SIP allocations.`,
      `When planning portfolio drawdowns (SWP) to ensure your principal does not deplete prematurely.`,
      `To test the cost of delaying your investments by even a few years.`
    ];
    benefits = [
      `Accurately accounts for regular compounding frequencies to show your true potential.`,
      `Includes inflation-adjustment parameters so you see your future wealth's real purchasing power.`,
      `Provides clear historical models to support realistic investment return expectations.`,
      `Empowers you with visual growth curve timelines illustrating the power of time.`
    ];
    limitations = [
      `Assumes a static annual rate of return, whereas actual equity markets experience volatility and sequence of return risks.`,
      `Does not include variable expense ratios, broker fees, or capital gains tax drag.`,
      `Past mathematical projection performance is not a guaranteed predictor of future investment gains.`
    ];
    mistakes = [
      `Underestimating the erosive power of inflation on your nominal retirement savings values.`,
      `Starting to invest late; the Cost of Delay Calculator illustrates that delaying 5 years can wipe out half your nest egg.`,
      `Chasing unsustainably high yield projections instead of focusing on consistent systematic contributions.`
    ];
    tips = [
      `Automate your SIP contributions immediately following your monthly salary credit to pay yourself first.`,
      `Step-up your monthly savings by at least 5% to 10% annually to match salary raises and defeat lifestyle inflation.`,
      `Keep your investment costs low by preferring low-expense-ratio index funds over expensive active funds.`
    ];
  } else {
    // Default / Tax / General
    intro = `The ${calc.name} serves as an essential tool to optimize your budget, analyze tax brackets, or structure business unit prices. Clear mathematical modeling of cash inflows and outflows is the foundational step toward achieving sustainable profitability and tax efficiency.`;
    whenToUse = [
      `When structuring annual personal budgets to ensure savings targets are achieved.`,
      `To compute net salary payouts after accounting for standard progressive tax brackets.`,
      `When evaluating business break-even points before investing in retail product inventories.`,
      `To assess daily cash flow and utility expenditures for optimization.`
    ];
    benefits = [
      `Saves time by compiling complex state tax rules and math into seconds.`,
      `Enables side-by-side scenario modeling to find optimal business price levels.`,
      `Provides structured breakdowns showing precisely where every dollar goes.`,
      `Maintains complete offline local privacy — none of your financial inputs are saved or transmitted.`
    ];
    limitations = [
      `Subject to annual changes in federal, state, and local tax legislation codes.`,
      `Standard deductions represent generic profiles and might miss unique personal filing advantages.`,
      `Does not serve as legal or certified public accounting (CPA) corporate tax advice.`
    ];
    mistakes = [
      `Failing to track small recurring subscription drains which add up to thousands of dollars annually.`,
      `Confusing marginal tax brackets with effective tax rates, leading to inaccurate tax planning.`,
      `Neglecting to account for business variable costs when establishing product prices.`
    ];
    tips = [
      `Conduct a comprehensive financial health audit twice a year to reallocate underperforming assets.`,
      `Maintain a strict 6-month liquid cash cushion inside high-yield savings to block high-interest emergency borrowing.`,
      `Always keep business operational costs entirely segregated from personal family accounts.`
    ];
  }

  // Live Step-by-Step calculation text generation using live inputs
  const stepByStep: string[] = [];
  const primaryVal = inputs[calc.inputs[0]?.id] ?? calc.inputs[0]?.defaultValue;
  const secondaryVal = inputs[calc.inputs[1]?.id] ?? calc.inputs[1]?.defaultValue;
  const tertiaryVal = inputs[calc.inputs[2]?.id] ?? calc.inputs[2]?.defaultValue;

  stepByStep.push(`Identify all required parameters. Based on your current entries, we have a starting input of ${calc.inputs[0]?.name || 'Value'}: ${Number(primaryVal).toLocaleString()}.`);
  if (calc.inputs[1]) {
    stepByStep.push(`Integrate the second variable ${calc.inputs[1].name}: ${secondaryVal}${calc.inputs[1].unit || ''}.`);
  }
  if (calc.inputs[2]) {
    stepByStep.push(`Align parameters over the specified timeline or constraint of ${calc.inputs[2].name}: ${tertiaryVal}${calc.inputs[2].unit || ''}.`);
  }
  stepByStep.push(`Apply the mathematical framework formula: ${calc.formula}.`);
  stepByStep.push(`Execute compounding math over all active periods. Our engine completes these iterative loops instantly to render your live report.`);

  return {
    author: 'FinanceCalc Editorial Team',
    authorRole: 'Editorial Integrity Team',
    lastUpdated: 'July 2026',
    readingTime: '4 Min',
    introduction: intro,
    whenToUse,
    benefits,
    limitations,
    variables: variablesList,
    stepByStep,
    mistakes,
    tips,
    disclaimer: `Disclaimer: This calculator is provided for educational and illustrative purposes only. The mathematical results generated do not constitute certified financial, legal, or investment advice. Interest rates, tax brackets, and market performance fluctuate dynamically over time. Always perform independent due diligence or consult with a certified financial planner (CFP) or certified public accountant (CPA) before making major transactional decisions.`
  };
}
