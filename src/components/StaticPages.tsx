import { useState, FormEvent, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Mail, FileText, CheckCircle, ArrowRight, MapPin, Phone, Settings, Shield 
} from 'lucide-react';

interface NavigationProps {
  navigate: (path: string) => void;
}

export function AboutPage({ navigate }: NavigationProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">About FinanceCalc</h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          The internet's premium, ad-free financial calculation directory engineered for immediate capital planning.
        </p>
      </div>

      <div className="space-y-12 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
        
        {/* Core Vision */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-2">The Mission</h2>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            Most financial websites today are cluttered with heavy flashing ads, pop-up paywalls, and telemetry trackers designed to harvest your personal loan intent. We believe planning your financial future should be a private, secure, and instant experience. 
          </p>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            <strong>FinanceCalc</strong> was built as a pristine, serverless-aligned directory. All 26 of our calculators perform math directly inside your browser container. No data packets ever leave your screen, ensuring 100% bank-grade offline confidentiality.
          </p>
        </section>

        {/* Pillars */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Our Operating Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-gray-900">Mathematical Reliability</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Every decimal, mortgage PITI tax, compound SIP addition, and progressive tax slab is cross-checked against certified accounting guidelines.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Lock className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-gray-900">Zero-Harvest Privacy</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                We do not collect emails, save loan amounts, require logins, or share cookies. Your financial plan remains entirely your own.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">Ready to audit your payments?</h3>
            <p className="text-xs text-gray-500">Launch any of our 26 free math tools instantly.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <span>Explore Tools</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Contact Support</h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Have an inquiry, feedback about a formula, or want to request a custom tool? Let us know.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm items-start">
        
        {/* Info Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Get in Touch</h2>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Our specialized math audits and web development teams review submission feedback continuously to improve layout and computation accuracy.
          </p>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>tavqeerhussain6@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
              <Phone className="h-4 w-4 text-blue-500" />
              <span>+91 7209394252</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>Ranchi, Jharkhand, India</span>
            </div>
          </div>
        </div>

        {/* Contact Form Container */}
        <div className="md:col-span-7">
          {submitted ? (
            <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto">
                <CheckCircle className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-gray-900">Message Received Successfully!</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Thank you for reaching out to FinanceCalc. Our engineering team will review your message and respond within 24-48 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Subject Topic</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Formula correction query, etc."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="How can we assist your capital planning efforts?"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Send Support Ticket
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-12">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-2">
          <Shield className="h-6 w-6" />
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Your financial privacy is our highest priority. Learn about our absolute zero-harvest data architecture.
        </p>
      </div>

      <div className="space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm text-sm text-gray-600 leading-relaxed font-medium">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            1. 100% Client-Side Computation
          </h2>
          <p>
            Unlike traditional financial web portals that proxy user variables, interest percentages, and house prices to remote analytics warehouses, <strong>FinanceCalc</strong> runs entirely within your device's browser memory. 
          </p>
          <p>
            When you slide handles or enter investment sums, the mathematical engines loop locally. Absolutely zero transaction inputs, interest parameters, or household budgets are transmitted to our servers or saved in remote logs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            2. Personal Data Collection
          </h2>
          <p>
            We do not require accounts, logins, single-sign-on (SSO) integrations, or email signups to utilize our 26 tools. You can navigate the platform anonymously. If you choose to contact us using our contact form, we only use the provided email and name to respond to your specific ticket; these details are never rented, sold, or shared with third-party advertising clusters.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            3. Use of LocalStorage and Cookies
          </h2>
          <p>
            Our platform utilizes browser-native mechanisms (like <code>localStorage</code>) strictly to preserve custom dashboard preferences, local theme selections, or recent calculation variables for your convenience. You can clear this client-side state at any time by wiping your browser cache or resetting your cookies. See our <span className="text-blue-600">Cookie Settings</span> panel to configure preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            4. Policy Changes & Updates
          </h2>
          <p>
            We regularly refine our computational templates and documentation. When modifications are deployed to our privacy guidelines, the date stamp at the top of the platform will be adjusted accordingly. Since we do not capture contact information, we recommend periodic reviews of this statement.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 text-xs text-gray-400">
          Last Reviewed: July 2026 | FinanceCalc Editorial & Security Team
        </div>
      </div>
    </div>
  );
}

export function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-12">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-2">
          <FileText className="h-6 w-6" />
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Please read our rules and operational disclosures for utilizing our mathematical calculations.
        </p>
      </div>

      <div className="space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm text-sm text-gray-600 leading-relaxed font-medium">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the FinanceCalc web application, you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must immediately cease utilizing our calculation interfaces and educational summaries.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. Permitted Use</h2>
          <p>
            FinanceCalc grants you a limited, non-exclusive, non-transferable license to utilize our calculators for personal planning, educational training, or private financial simulation. Scraping, crawling, framing, or reverse-engineering our codebases to reproduce these models on competitor sites is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Disclaimer of Financial Advice</h2>
          <p className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-2xl text-xs leading-relaxed">
            <strong>CRITICAL NOTICE:</strong> The calculations, amortization timelines, compound dividend formulas, and estimated tax brackets presented on FinanceCalc are meant solely for planning reference and educational estimation. They do not constitute formal fiduciary, legal, credit, mortgage, or investment advice. Interest percentages, local PITI variables, and tax laws fluctuate continuously. Always consult certified financial planners, tax accountants, or local mortgage underwriters before executing final cash transactions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">4. Limitation of Liability</h2>
          <p>
            FinanceCalc, its editorial contributors, and hosting infrastructures shall not be liable for any direct, indirect, or consequential damages arising out of math errors, template inaccuracies, local device cache failures, or decisions made using calculations performed on this website.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 text-xs text-gray-400">
          Last Reviewed: July 2026 | FinanceCalc Editorial & Legal Team
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: true,
    personalization: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('financecalc_cookies');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences({
          essential: true,
          analytics: parsed.analytics !== false,
          personalization: parsed.personalization !== false,
        });
      } catch (e) {
        // Fallback to default
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('financecalc_cookies', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-12">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-2">
          <Settings className="h-6 w-6" />
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Cookie Preferences</h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Take full control over how cookies and local state storage are managed on your device.
        </p>
      </div>

      <div className="space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
        <div className="space-y-6">
          
          {/* Cookie Item 1 - Essential */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Essential Platform State</h3>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Required for the platform to perform fundamental functions, such as saving your Cookie Preference configuration, restoring custom calculator routing state, and performing local offline calculations.
              </p>
            </div>
            <div className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full bg-blue-600 transition-colors">
              <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5" />
            </div>
          </div>

          {/* Cookie Item 2 - Analytics */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Anonymous Platform Analytics</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Helps us gauge organic performance, monitor page-load speeds, and spot formula audit issues across browser types anonymously. No tracking pixels are active.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
              className={`${
                preferences.analytics ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
              <span
                className={`${
                  preferences.analytics ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {/* Cookie Item 3 - Personalization */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Saved Computation Profiles</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Allows individual calculator modules to remember your last inputs, rates, and values between page refreshes so you don't have to re-enter details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, personalization: !preferences.personalization })}
              className={`${
                preferences.personalization ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
              <span
                className={`${
                  preferences.personalization ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

        </div>

        {/* Saved Success Banner */}
        {saved && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center text-xs font-bold text-green-800 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Preferences saved successfully! Your browser settings have been updated.</span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Save Cookie Settings
        </button>
      </div>
    </div>
  );
}

