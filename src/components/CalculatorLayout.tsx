import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Check, ChevronDown, ChevronUp,
  BookOpen, AlertCircle, Info, Landmark, HelpCircle as HelpIcon,
  Download, Sparkles, Clock, Calendar, UserCheck, ShieldCheck, TrendingUp, XCircle, Lightbulb
} from 'lucide-react';
import { CalculatorDef, CalculatorResult } from '../types';
import { DonutChart, GrowthAreaChart } from './Charts';
import { allCalculators } from '../calculators';
import { exportToCSV } from '../utils/exports';
import { getEduContent } from '../utils/eduContent';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';
import { ExportMenu } from './ExportMenu';
import { useSEO } from '../hooks/useSEO';

interface CalculatorLayoutProps {
  calc: CalculatorDef;
  navigate: (path: string) => void;
}

export function CalculatorLayout({ calc, navigate }: CalculatorLayoutProps) {
  useSEO(calc);
  const { format, currentCurrency } = useCurrency();

  // Helper to dynamically parse and format currency values containing $
  const formatSummaryValue = (val: any): any => {
    if (typeof val !== 'string') return val;
    return val.replace(/\$([0-9,]+(?:\.[0-9]+)?)/g, (match, numStr) => {
      const num = parseFloat(numStr.replace(/,/g, ''));
      if (!isNaN(num)) {
        return format(num);
      }
      return match;
    });
  };

  // Ref for full page — used by PDF export to capture the print-layout view
  const pageRef = useRef<HTMLDivElement>(null);

  // Scenario A vs B Comparison State
  const [comparisonMode, setComparisonMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'A' | 'B'>('A');
  const [formInputs, setFormInputs] = useState<Record<string, any>>({});
  const [formInputsB, setFormInputsB] = useState<Record<string, any>>({});

  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Initialize form defaults for both Scenarios
  useEffect(() => {
    const defaults: Record<string, any> = {};
    calc.inputs.forEach((input) => {
      defaults[input.id] = input.defaultValue;
    });
    setFormInputs(defaults);
    setFormInputsB(defaults);
    setActiveTab('chart');
    setOpenFaqIndex(null);
    setComparisonMode(false);
    setActiveScenario('A');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [calc]);

  // Handle single input update based on active scenario
  const handleInputChange = (id: string, value: any) => {
    if (comparisonMode && activeScenario === 'B') {
      setFormInputsB((prev) => ({
        ...prev,
        [id]: value
      }));
    } else {
      setFormInputs((prev) => ({
        ...prev,
        [id]: value
      }));
    }
  };

  // Run calculation engine for both scenarios
  const result: CalculatorResult = calc.calculate(formInputs);
  const resultB: CalculatorResult = calc.calculate(formInputsB);

  // Copy shareable URL

  // CSV Exporter for dynamic schedules
  const handleCSVExport = () => {
    const activeResult = comparisonMode && activeScenario === 'B' ? resultB : result;
    if (!activeResult.charts) return;

    const currencySuffix = ` (${currentCurrency.code})`;

    if (activeResult.charts.amortization) {
      const headers = [
        'Year',
        `Annual Payment${currencySuffix}`,
        `Principal Paid${currencySuffix}`,
        `Interest Paid${currencySuffix}`,
        `Outstanding Balance${currencySuffix}`
      ];
      const rows = activeResult.charts.amortization.map((row) => [
        row.period,
        Math.round(row.payment),
        Math.round(row.principal),
        Math.round(row.interest),
        Math.round(row.remainingBalance),
      ]);
      exportToCSV(headers, rows, `${calc.slug}_ledger_statement`);
    } else if (activeResult.charts.growth) {
      const headers = [
        'Year',
        `Total Invested${currencySuffix}`,
        `Interest Accumulated${currencySuffix}`,
        `Maturity Value${currencySuffix}`
      ];
      const rows = activeResult.charts.growth.map((row) => [
        row.year,
        Math.round(row.invested),
        Math.round(row.interest),
        Math.round(row.total),
      ]);
      exportToCSV(headers, rows, `${calc.slug}_investment_growth`);
    } else if (activeResult.charts.brackets) {
      const headers = [
        'Tax Rate',
        'Taxable Range',
        `Taxable Income${currencySuffix}`,
        `Tax Amount${currencySuffix}`
      ];
      const rows = activeResult.charts.brackets.map((row) => [
        `${row.rate}%`,
        row.range,
        Math.round(row.taxableIncome),
        Math.round(row.taxAmount),
      ]);
      exportToCSV(headers, rows, `${calc.slug}_tax_bracket_split`);
    }
  };

  // Get similar/related calculators
  const relatedCalcs = allCalculators
    .filter((c) => c.category === calc.category && c.id !== calc.id)
    .slice(0, 4);

  const displayInputs = comparisonMode && activeScenario === 'B' ? formInputsB : formInputs;
  const edu = getEduContent(calc, displayInputs);

  return (
    <div ref={pageRef} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Printable Print Header */}
      <div className="hidden print:block text-center mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">FinanceCalc - {calc.name} Report</h1>
        <p className="text-sm text-gray-500 mt-2">Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        <p className="text-xs text-gray-400 mt-1">Visit https://financecalc-one.vercel.app/ for professional, free calculations</p>
      </div>

      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-500 print:hidden">
        <button onClick={() => navigate('/')} className="hover:text-blue-600 cursor-pointer">Home</button>
        <span>/</span>
        <span className="capitalize">{calc.category} Calculators</span>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{calc.name}</span>
      </nav>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Directory</span>
      </button>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm print:hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{calc.name}</h1>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{calc.description}</p>
          </div>

          {/* Scenario Comparison Mode Activation Block */}
          <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl mb-6 shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Scenario Comparison Mode
              </span>
              <span className="text-[10px] text-blue-700">Contrast different values side-by-side</span>
            </div>
            <button
              onClick={() => {
                if (!comparisonMode) {
                  setFormInputsB({ ...formInputs });
                }
                setComparisonMode(!comparisonMode);
                setActiveScenario('A');
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${comparisonMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${comparisonMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {/* Scenario Tab Selectors */}
          {comparisonMode && (
            <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-150 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveScenario('A')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeScenario === 'A'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 scale-105'
                    : 'text-gray-500 hover:text-gray-900 bg-white/40'
                  }`}
              >
                Configure Scenario A
              </button>
              <button
                onClick={() => setActiveScenario('B')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeScenario === 'B'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 scale-105'
                    : 'text-gray-500 hover:text-gray-900 bg-white/40'
                  }`}
              >
                Configure Scenario B
              </button>
            </div>
          )}

          <div className="space-y-6">
            {calc.inputs.map((input) => {
              const value = displayInputs[input.id] ?? input.defaultValue;

              return (
                <div key={input.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      {input.name}
                      {input.unit && <span className="text-xs text-gray-400 font-normal">({input.unit})</span>}
                    </label>

                    {/* Synchronized Precision Input Box */}
                    {input.type !== 'select' && input.type !== 'date' && (
                      <div className="relative rounded-lg shadow-sm">
                        {input.prefix === '$' ? (
                          <CurrencySelector />
                        ) : input.prefix ? (
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                            <span className="text-xs text-gray-400 font-medium">{input.prefix}</span>
                          </div>
                        ) : null}
                        <input
                          type="number"
                          value={value}
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          onChange={(e) => {
                            let val = e.target.value === '' ? '' : Number(e.target.value);
                            handleInputChange(input.id, val);
                          }}
                          className={`rounded-lg border border-gray-200 py-1 text-right text-xs font-semibold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${input.prefix === '$'
                              ? 'w-44 pl-18 pr-2.5'
                              : input.prefix
                                ? 'w-28 pl-6 pr-2.5'
                                : 'w-28 px-2.5'
                            }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Slider Control */}
                  {input.type === 'slider' && (
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        value={value}
                        onChange={(e) => handleInputChange(input.id, Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-150 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>{input.prefix || ''}{input.min}{input.unit || ''}</span>
                        <span>{input.prefix || ''}{input.max}{input.unit || ''}</span>
                      </div>
                    </div>
                  )}

                  {/* Standard Select Menu */}
                  {input.type === 'select' && (
                    <select
                      value={value}
                      onChange={(e) => handleInputChange(input.id, Number(e.target.value) || e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {input.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Date Picker */}
                  {input.type === 'date' && (
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  )}

                  {/* Direct Number Input (without slider) */}
                  {input.type === 'number' && !input.min && (
                    <div className="relative mt-1">
                      {input.prefix === '$' ? (
                        <CurrencySelector />
                      ) : input.prefix ? (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-sm text-gray-400">{input.prefix}</span>
                        </div>
                      ) : null}
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(input.id, Number(e.target.value))}
                        className={`w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${input.prefix === '$' ? 'pl-20 pr-3' : input.prefix ? 'pl-8 pr-3' : 'px-3'
                          }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Results */}
        <div className="lg:col-span-7 space-y-6">

          {/* Action Operations Panel */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm print:hidden">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Landmark className="h-4 w-4 text-blue-500" /> Interactive Report
            </span>
            <ExportMenu
              calc={calc}
              pageRef={pageRef}
            />
          </div>

          {/* Results Summary Dashboard */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              Calculation Output
            </h3>

            {!comparisonMode ? (
              // Standard Output Summary List
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {result.summary.map((sum, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all ${index === 0
                        ? 'bg-blue-50/50 border-blue-100 col-span-1 sm:col-span-2 shadow-sm'
                        : 'bg-gray-50/50 border-gray-100'
                      }`}
                  >
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{sum.label}</span>
                    <div
                      className={`mt-1 font-extrabold tracking-tight ${index === 0 ? 'text-3xl text-blue-600' : 'text-xl text-gray-900'
                        }`}
                      style={{ color: sum.color }}
                    >
                      {formatSummaryValue(sum.value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Scenario Comparison Mode Output Summary List
              <div className="space-y-4 mb-8">
                {result.summary.map((sum, index) => {
                  const valA = result.summary[index]?.value;
                  const valB = resultB.summary[index]?.value;

                  // Attempt variance parsing safely
                  const numA = Number(String(valA).replace(/[^0-9.-]/g, '')) || 0;
                  const numB = Number(String(valB).replace(/[^0-9.-]/g, '')) || 0;
                  const diff = numB - numA;
                  const isPercent = String(valA).includes('%');

                  let varianceText = '';
                  let isPositiveBetter = true; // default e.g. compound returns
                  if (calc.category === 'loan' || calc.category === 'tax') {
                    isPositiveBetter = false; // lower payments are better
                  }

                  const isBSaving = isPositiveBetter ? diff > 0 : diff < 0;

                  if (diff !== 0) {
                    const sign = diff > 0 ? '+' : '';
                    const formattedDiff = isPercent ? `${sign}${diff.toFixed(2)}%` : format(Math.abs(diff));
                    varianceText = isBSaving
                      ? `${isPercent ? '+' : 'Saves '}${formattedDiff} in Scenario B`
                      : `${isPercent ? '-' : 'Saves '}${formattedDiff} in Scenario A`;
                  } else {
                    varianceText = 'Equal values';
                  }

                  return (
                    <div key={index} className="p-4 rounded-xl border border-gray-150 bg-white shadow-sm grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{sum.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Scenario A</span>
                          <span className="text-base font-extrabold text-slate-800">{formatSummaryValue(valA)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Scenario B</span>
                          <span className="text-base font-extrabold text-blue-600">{formatSummaryValue(valB)}</span>
                          {diff !== 0 && (
                            <span className={`block text-[10px] font-semibold mt-0.5 ${isBSaving ? 'text-green-600' : 'text-amber-600'}`}>
                              {varianceText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Graphs and Tabs */}
            {(result.charts || (comparisonMode && resultB.charts)) && (
              <div className="space-y-6">

                {/* Tab select list */}
                {(result.charts?.amortization || result.charts?.growth || result.charts?.brackets || result.charts?.budget || result.charts?.debt) && (
                  <div className="flex items-center justify-between border-b border-gray-200 print:hidden">
                    <div className="flex">
                      <button
                        onClick={() => setActiveTab('chart')}
                        className={`py-2 px-4 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${activeTab === 'chart'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Visual Charts
                      </button>
                      <button
                        onClick={() => setActiveTab('table')}
                        className={`py-2 px-4 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${activeTab === 'table'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Detailed Ledger / Data
                      </button>
                    </div>

                    {/* CSV Download Trigger button */}
                    {activeTab === 'table' && (
                      <button
                        onClick={handleCSVExport}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-100 transition-colors cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download CSV</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Chart View */}
                {activeTab === 'chart' && (
                  <div className="space-y-6">
                    {/* Donut Chart */}
                    {result.charts?.pie && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Asset Allocation Breakdown</h4>
                        {!comparisonMode ? (
                          <DonutChart data={result.charts.pie} />
                        ) : (
                          // Double asset allocation charts for comparison mode
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-100 rounded-xl">
                              <span className="block text-xs font-bold text-gray-500 mb-2 text-center">Scenario A</span>
                              <DonutChart data={result.charts.pie} />
                            </div>
                            {resultB.charts?.pie && (
                              <div className="p-4 border border-gray-100 rounded-xl">
                                <span className="block text-xs font-bold text-gray-500 mb-2 text-center">Scenario B</span>
                                <DonutChart data={resultB.charts.pie} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Area Growth Chart */}
                    {result.charts?.growth && (
                      <div className="mt-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Wealth Projection over Time</h4>
                        {!comparisonMode ? (
                          <GrowthAreaChart data={result.charts.growth} />
                        ) : (
                          // Plot comparison growth curves
                          <div className="space-y-6">
                            <div className="p-4 border border-gray-100 rounded-xl">
                              <span className="block text-xs font-bold text-gray-500 mb-2">Scenario A Growth Trend</span>
                              <GrowthAreaChart data={result.charts.growth} />
                            </div>
                            {resultB.charts?.growth && (
                              <div className="p-4 border border-gray-100 rounded-xl">
                                <span className="block text-xs font-bold text-gray-500 mb-2">Scenario B Growth Trend</span>
                                <GrowthAreaChart data={resultB.charts.growth} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 50/30/20 Budget Bar List */}
                    {result.charts?.budget && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Budget Target Contrast</h4>
                        {result.charts.budget.map((b, idx) => (
                          <div key={idx} className="space-y-1.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between text-xs font-bold text-gray-700">
                              <span>{b.label} ({b.pct.toFixed(1)}%)</span>
                              <span className={b.status === 'Over budget' ? 'text-red-500' : 'text-green-500'}>{b.status}</span>
                            </div>
                            <div className="w-full bg-gray-250 h-2.5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, b.pct)}%`, backgroundColor: b.color }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span>Spent: {format(Math.round(b.amount))}</span>
                              <span>Target: {idx === 0 ? '50%' : idx === 1 ? '30%' : '20%'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Table View */}
                {activeTab === 'table' && (
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    {/* Render schedule for selected scenario in comparison mode, or default */}
                    {(() => {
                      const activeResult = comparisonMode && activeScenario === 'B' ? resultB : result;

                      return (
                        <>
                          {/* Amortization Table */}
                          {activeResult.charts?.amortization && (
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                              <thead className="bg-gray-50 text-gray-500 uppercase font-bold">
                                <tr>
                                  <th className="px-4 py-3 text-left">Year</th>
                                  <th className="px-4 py-3 text-right">Annual Payment</th>
                                  <th className="px-4 py-3 text-right">Principal Paid</th>
                                  <th className="px-4 py-3 text-right">Interest Paid</th>
                                  <th className="px-4 py-3 text-right">Outstanding Balance</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                {activeResult.charts.amortization.map((row, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-semibold">Yr {row.period}</td>
                                    <td className="px-4 py-3 text-right">{format(Math.round(row.payment))}</td>
                                    <td className="px-4 py-3 text-right">{format(Math.round(row.principal))}</td>
                                    <td className="px-4 py-3 text-right">{format(Math.round(row.interest))}</td>
                                    <td className="px-4 py-3 text-right">{format(Math.round(row.remainingBalance))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          {/* Growth Table */}
                          {activeResult.charts?.growth && (
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                              <thead className="bg-gray-50 text-gray-500 uppercase font-bold">
                                <tr>
                                  <th className="px-4 py-3 text-left">Year</th>
                                  <th className="px-4 py-3 text-right">Total Invested</th>
                                  <th className="px-4 py-3 text-right">Interest Accumulated</th>
                                  <th className="px-4 py-3 text-right">Maturity Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                {activeResult.charts.growth.map((row, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-semibold">Yr {row.year}</td>
                                    <td className="px-4 py-3 text-right">{format(Math.round(row.invested))}</td>
                                    <td className="px-4 py-3 text-right">{format(Math.round(row.interest))}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600">{format(Math.round(row.total))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          {/* Tax Brackets Table */}
                          {activeResult.charts?.brackets && (
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                              <thead className="bg-gray-50 text-gray-500 uppercase font-bold">
                                <tr>
                                  <th className="px-4 py-3 text-left">Tax Bracket Rate</th>
                                  <th className="px-4 py-3 text-left">Taxable Income Range</th>
                                  <th className="px-4 py-3 text-right">Taxable Income here</th>
                                  <th className="px-4 py-3 text-right">Tax Amount here</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                {activeResult.charts.brackets.map((row, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-semibold text-red-600">{row.rate}%</td>
                                    <td className="px-4 py-3 text-gray-500">{row.range}</td>
                                    <td className="px-4 py-3 text-right">{format(Math.round(row.taxableIncome))}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{format(Math.round(row.taxAmount))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amortization/Growth Table FOR PRINTING */}
      <div className="hidden print:block mt-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Complete Ledger Statement (Scenario A)</h2>
        {result.charts?.amortization && (
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border px-3 py-2 text-left">Year</th>
                <th className="border px-3 py-2 text-right">Annual Payment</th>
                <th className="border px-3 py-2 text-right">Principal Paid</th>
                <th className="border px-3 py-2 text-right">Interest Paid</th>
                <th className="border px-3 py-2 text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.charts.amortization.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">Yr {row.period}</td>
                  <td className="border px-3 py-2 text-right">{format(Math.round(row.payment))}</td>
                  <td className="border px-3 py-2 text-right">{format(Math.round(row.principal))}</td>
                  <td className="border px-3 py-2 text-right">{format(Math.round(row.interest))}</td>
                  <td className="border px-3 py-2 text-right">{format(Math.round(row.remainingBalance))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Editorial Authority Badge Card */}
      <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-100 shrink-0">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Last Reviewed</span>
              <span className="inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                Editorial Integrity Verified
              </span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">FinanceCalc Editorial Team</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 font-medium sm:border-l sm:pl-6 sm:border-slate-200">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Last Updated: {edu.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>Reading Time: {edu.readingTime}</span>
          </div>
        </div>
      </div>

      {/* Professional Introduction Block */}
      <section className="mt-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm print:hidden">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Introduction & Educational Resource</h2>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">{edu.introduction}</p>
      </section>

      {/* Applications & Benefits Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch print:hidden">

        {/* When to use checklist */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-blue-600" /> When to Use This Calculator
          </h3>
          <ul className="space-y-3">
            {edu.whenToUse.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strategic Benefits checklist */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" /> Key Benefits & Advantages
          </h3>
          <ul className="space-y-3">
            {edu.benefits.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Variables & Parameters Glossary */}
      <section className="mt-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm print:hidden">
        <h3 className="text-base font-bold text-gray-900 mb-4">Variables & Input Parameters Explained</h3>
        <p className="text-xs text-gray-500 mb-4">Understanding the operational bounds and financial significance of your configured inputs.</p>
        <div className="overflow-x-auto border border-gray-150 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Variable Name</th>
                <th className="px-4 py-3 text-center">Your Active Entry</th>
                <th className="px-4 py-3 text-left">Financial Context & Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {edu.variables.map((v, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold text-slate-800">{v.name}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-blue-600 bg-blue-50/30">{v.value}</td>
                  <td className="px-4 py-3 text-gray-500 leading-relaxed">{v.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Formula & Live Step-By-Step Math */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch print:hidden">

        {/* Mathematical Formula Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-sm">
          <div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
              <BookOpen className="h-4.5 w-4.5" />
            </span>
            <h3 className="text-lg font-bold text-gray-900">Mathematical Formula Used</h3>
            <p className="text-xs text-gray-500 mt-1">Below is the core arithmetic relationship evaluated dynamically by our calculator.</p>

            <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-150 font-mono text-sm text-blue-700 font-bold select-all overflow-x-auto text-center">
              {calc.formula}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed flex items-start gap-1.5 bg-blue-50/30 p-3 rounded-lg border border-blue-50 mt-4">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <span>{calc.formulaExplanation}</span>
          </p>
        </div>

        {/* Dynamic Step-by-Step Math with actual numbers */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-sm">
          <div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-4">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <h3 className="text-lg font-bold text-gray-900">Dynamic Step-By-Step Execution</h3>
            <p className="text-xs text-gray-500 mt-1">Review the arithmetic progression evaluating your current form values:</p>

            <ul className="mt-4 space-y-3 text-xs text-gray-600 font-medium">
              {edu.stepByStep.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-150 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Case Study Example */}
      <section className="mt-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm print:hidden">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-amber-500" /> Real-Life Planning Case Study
        </h3>
        <p className="text-xs text-gray-500 mb-4">Evaluating standard transaction structures helps establish realistic financial baseline plans.</p>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-150">
          <p className="text-sm text-gray-700 italic font-medium leading-relaxed">
            "{calc.example.scenario}"
          </p>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Mathematical Iteration Stages:</span>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 font-medium">
              {calc.example.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Common Mistakes vs Professional Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch print:hidden">

        {/* Mistakes to avoid */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-red-900 flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-red-600" /> Common Pitfalls & Mistakes to Avoid
          </h3>
          <ul className="space-y-3">
            {edu.mistakes.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium leading-relaxed">
                <span className="text-red-500 shrink-0 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Financial strategies */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-green-900 flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-green-600" /> Actionable Strategic Financial Tips
          </h3>
          <ul className="space-y-3">
            {edu.tips.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium leading-relaxed">
                <span className="text-green-500 shrink-0 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* FAQ Accordion Section */}
      <section className="mt-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm print:hidden">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HelpIcon className="h-5 w-5 text-blue-500" /> Frequently Asked Questions (FAQ)
        </h3>

        <div className="space-y-4">
          {calc.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="border-b border-gray-150 pb-4">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-blue-500" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-3.5 rounded-lg border border-gray-150">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Institutional Legal Disclaimer */}
      <footer className="mt-8 bg-gray-100 p-5 rounded-2xl border border-gray-200 print:hidden">
        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
          {edu.disclaimer}
        </p>
      </footer>

      {/* Related/Similar Calculators */}
      {relatedCalcs.length > 0 && (
        <section className="mt-12 print:hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            Similar Calculators You Might Need
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedCalcs.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/${item.slug}`)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200"
              >
                <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600">
                  {item.name}
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
