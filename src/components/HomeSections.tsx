import { 
  ArrowRight, ShieldCheck, Zap, Sparkles, Smartphone, HeartHandshake, CheckCircle,
  PiggyBank, LineChart, Percent, DollarSign, Clock, Users, Shield, BookOpen, Calculator
} from 'lucide-react';
import { allCalculators, categoriesMap } from '../calculators';
import { CalculatorDef } from '../types';

interface HomeSectionsProps {
  navigate: (path: string) => void;
}

export function HeroSection({ navigate }: HomeSectionsProps) {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      {/* Soft background shape */}
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-blue-50/30 rounded-l-[100px] hidden lg:block" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          
          {/* Headline Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              <Sparkles className="h-3.5 w-3.5" /> Direct, Secure Planning
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Finance Calculators for <span className="text-blue-600">Smarter</span> Financial Decisions
            </h1>
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Calculate loans, investments, taxes, savings, and retirement futures instantly with 100% accurate, industry-verified formulas. No login or paywalls.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById('calculators');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <span>Explore Calculators</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/emi-calculator')}
                className="inline-flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                EMI Calculator
              </button>
            </div>

            {/* Quick stats tags */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-gray-100 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="block text-2xl font-extrabold text-blue-600">26</span>
                <span className="text-[10px] font-bold uppercase text-gray-400">Total Tools</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-blue-600">100%</span>
                <span className="text-[10px] font-bold uppercase text-gray-400">Secure Client</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-blue-600">Free</span>
                <span className="text-[10px] font-bold uppercase text-gray-400">No Signup</span>
              </div>
            </div>
          </div>

          {/* Interactive Mock Dashboard Hero Art */}
          <div className="lg:col-span-6 mt-12 lg:mt-0 relative">
            <div className="relative mx-auto max-w-md sm:max-w-lg bg-gray-50 p-6 rounded-3xl border border-gray-200/60 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="ml-1 text-[10px] font-mono font-semibold text-gray-400">financecalc_dashboard.pkg</span>
                </div>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded">Live Projection</span>
              </div>

              {/* Bento Grid inside dashboard mockup */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Micro stat card 1 */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Est. Monthly EMI</span>
                    <span className="block text-xl font-black text-gray-900 mt-1">$1,240.40</span>
                  </div>
                  <span className="text-[9px] text-green-600 mt-2 font-semibold">✔ Calculated at 6.2%</span>
                </div>

                {/* Micro stat card 2 */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Compound Yield</span>
                    <span className="block text-xl font-black text-blue-600 mt-1">$412,850</span>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-2 font-semibold">★ $100/mo SIP trend</span>
                </div>

                {/* Mock pie graph block */}
                <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-r-green-500 border-b-yellow-500 animate-spin-slow" />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Investment Balance</span>
                    <div className="flex gap-2 text-[10px] font-semibold">
                      <span className="text-blue-600">■ Principal</span>
                      <span className="text-green-500">■ Gains</span>
                      <span className="text-yellow-500">■ Taxes</span>
                    </div>
                  </div>
                </div>

                {/* Progress outline */}
                <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-700">
                    <span>50/30/20 Budget Status</span>
                    <span className="text-green-600">On Target</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-600" style={{ width: '50%' }} />
                    <div className="h-full bg-yellow-500" style={{ width: '30%' }} />
                    <div className="h-full bg-green-500" style={{ width: '20%' }} />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export function FeatureSection() {
  const features = [
    { icon: Zap, title: 'Instant Math Calculations', desc: 'No loading screens or server wait. Formula results evaluate live inside your browser.' },
    { icon: ShieldCheck, title: '100% Accurate Formulas', desc: 'Sourced from standard certified banking guidelines, ensuring complete spreadsheet precision.' },
    { icon: Shield, title: 'No Login or Signup Required', desc: 'Enjoy unlimited access to all 26 tools without ever giving away your email or cell number.' },
    { icon: Smartphone, title: 'Perfect Mobile Responsive', desc: 'Sleek responsive design built specifically for smart devices to calculate on the go.' },
    { icon: HeartHandshake, title: 'Completely Free Forever', desc: 'No hidden paywalls, subscription limitations, or premium features locked behind cards.' },
    { icon: BookOpen, title: 'Educational SEO Content', desc: 'Every calculator page features standard formula lists, real-world step-by-step examples, and FAQs.' }
  ];

  return (
    <section className="bg-gray-50 py-16 border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Designed for Financial Clarity and Trust
          </h2>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            Unlike other busy, ad-heavy calculation sites, FinanceCalc values pristine typography, absolute user privacy, and scientific formula precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <feat.icon className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">{feat.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export function PopularCalculators({ navigate }: HomeSectionsProps) {
  // Select top/popular calculators to display
  const popularSlugs = [
    'emi-calculator', 'mortgage-calculator', 'home-loan-calculator', 'sip-calculator', 
    'fd-calculator', 'rd-calculator', 'ppf-calculator', 'mutual-fund-calculator', 
    'compound-interest-calculator', 'income-tax-calculator', 'gst-calculator', 
    'budget-planner', 'debt-payoff-calculator', 'age-calculator'
  ];

  const populars = allCalculators.filter(c => popularSlugs.includes(c.slug));

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'loan': return 'bg-blue-50 text-blue-700';
      case 'investment': return 'bg-green-50 text-green-700';
      case 'tax': return 'bg-red-50 text-red-700';
      case 'savings': return 'bg-amber-50 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <section id="calculators" className="py-16 bg-white scroll-mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Popular Calculators</h2>
            <p className="text-sm text-gray-500">Quickly launch our most utilized compound calculators.</p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('categories');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All 26 Calculators</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {populars.map((calc) => (
            <div
              key={calc.id}
              onClick={() => navigate(`/${calc.slug}`)}
              className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getCategoryColor(calc.category)}`}>
                    {calc.category}
                  </span>
                  <Calculator className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {calc.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {calc.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Launch Tool</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export function CategoriesSection({ navigate }: HomeSectionsProps) {
  const categoriesList = [
    { key: 'loan', title: 'Loan Calculators', desc: 'EMIs, Mortgages, Car loans, Bike loans, eligibility, and down payments.' },
    { key: 'investment', title: 'Investment Calculators', desc: 'SIPs, Mutual funds, Compound Interest, Fixed deposits (FD), Recurring deposits (RD), and CAGR.' },
    { key: 'tax', title: 'Tax & Salary', desc: 'Progressive income tax brackets, paystubs, payroll deductions, and GST inclusive/exclusive invoices.' },
    { key: 'savings', title: 'Savings & Personal Finance', desc: '50/30/20 budgets, Debt snowball payoff acceleration, and compound PPF wealth.' },
    { key: 'everyday', title: 'Everyday Calculators', desc: 'Purchasing power inflation erosion, currency converter conversions, and exact age chronologies.' }
  ];

  return (
    <section id="categories" className="py-16 bg-gray-50 border-t border-gray-200 scroll-mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-1 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Browse by Financial Category</h2>
          <p className="text-sm text-gray-500">Every calculator is categorized for quick organizational access.</p>
        </div>

        <div className="space-y-8">
          {categoriesList.map((cat) => {
            const calcs = allCalculators.filter(c => c.category === cat.key);
            
            return (
              <div key={cat.key} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-900">{cat.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {calcs.map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => navigate(`/${calc.slug}`)}
                      className="flex items-center justify-between text-left px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 hover:text-blue-700 transition-all text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      <span>{calc.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
