import { Calculator, ShieldCheck, HelpCircle, Lock, Mail } from 'lucide-react';
import { categoriesMap } from '../calculators';

interface FooterProps {
  navigate: (path: string) => void;
}

export function Footer({ navigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Logo & Platform Info */}
          <div className="space-y-6">
            <div onClick={() => navigate('/')} className="flex cursor-pointer items-center gap-2.5 select-none">
              <img src="/logo.png" alt="FinanceCalc Logo" className="h-9 w-9 rounded-lg shadow-sm object-contain" />
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Finance<span className="text-blue-600">Calc</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Making financial calculations fast, transparent, and completely free. Plan mortgages, investments, salary slips, and taxes with absolute precision.
            </p>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>100% Secure, Client-Side Calculations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-green-500" />
                <span>No Personal Data Ever Collected</span>
              </div>
            </div>
          </div>

          {/* Quick Links / Categories Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
                <ul className="space-y-3">
                  {Object.entries(categoriesMap).map(([key, label]) => (
                    <li key={key}>
                      <button
                        onClick={() => navigate(`/#categories`)}
                        className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer text-left"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Calculators</h3>
                <ul className="space-y-3">
                  <li>
                    <button onClick={() => navigate('/emi-calculator')} className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer text-left">
                      EMI Calculator
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/sip-calculator')} className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer text-left">
                      SIP Calculator
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/mortgage-calculator')} className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer text-left">
                      Mortgage Calculator
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/income-tax-calculator')} className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer text-left">
                      Income Tax Calculator
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Platform</h3>
                <ul className="space-y-3">
                  <li>
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
                      Home
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/blog')} className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer">
                      Finance Guides
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/about')} className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
                      About Us
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/contact')} className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
                      Contact
                    </button>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Disclaimer</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Financial calculations provided are for educational and planning purposes only. Please consult certified credit or tax professionals before making final lifestyle or investment decisions.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Lower copyright bar */}
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} FinanceCalc. All rights reserved. Precision-engineered for smart capital allocation.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-blue-600 transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/terms-of-service')} className="hover:text-blue-600 transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => navigate('/cookie-settings')} className="hover:text-blue-600 transition-colors cursor-pointer">Cookie Settings</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
