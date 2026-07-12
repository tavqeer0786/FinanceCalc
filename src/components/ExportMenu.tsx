import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Share2, ChevronDown, FileDown, Copy, Printer, Check, X, Loader2
} from 'lucide-react';
import { CalculatorDef, CalculatorResult } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { generatePdfReport } from '../utils/pdfExport';
import { shareLink, copyToClipboard } from '../utils/share';

interface ExportMenuProps {
  calc: CalculatorDef;
  result: CalculatorResult;
  resultB: CalculatorResult;
  comparisonMode: boolean;
  formInputs: Record<string, any>;
  formInputsB: Record<string, any>;
  chartRef: React.RefObject<HTMLDivElement | null>;
}

type ToastState = { visible: boolean; message: string; type: 'success' | 'error' };

export function ExportMenu({
  calc, result, resultB, comparisonMode,
  formInputs, formInputsB, chartRef,
}: ExportMenuProps) {
  const { currentCurrency, format, formatSummaryValue } = useCurrency() as any;

  const [isOpen, setIsOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleDownloadPdf = async () => {
    setIsOpen(false);
    setIsPdfLoading(true);
    try {
      // Helper so pdfExport can format summary values with currency replacement
      const formatSummaryStr = (val: string | number) => {
        if (typeof val !== 'string') return String(val);
        return val.replace(/\$([0-9,]+(?:\.[0-9]+)?)/g, (_match: string, numStr: string) => {
          const num = parseFloat(numStr.replace(/,/g, ''));
          return isNaN(num) ? _match : format(num);
        });
      };

      await generatePdfReport({
        calc,
        result,
        resultB,
        comparisonMode,
        formInputs,
        formInputsB,
        currency: currentCurrency,
        formatValue: format,
        formatSummary: formatSummaryStr,
        chartRef,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast('PDF generation failed. Please try again.', 'error');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleShareLink = async () => {
    setIsOpen(false);
    const used = await shareLink(`${calc.name} Calculator`, window.location.href);
    if (!used) showToast('✓ Link copied to clipboard');
  };

  const handleCopyLink = async () => {
    setIsOpen(false);
    await copyToClipboard(window.location.href);
    showToast('✓ Link copied to clipboard');
  };

  const handlePrint = () => {
    setIsOpen(false);
    window.print();
  };

  // ── Menu items config ────────────────────────────────────────────────────

  const menuItems = [
    {
      id: 'download-pdf',
      label: 'Download PDF',
      description: 'Premium report with charts',
      icon: isPdfLoading
        ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        : <FileDown className="h-4 w-4 text-blue-500" />,
      onClick: handleDownloadPdf,
      disabled: isPdfLoading,
      highlight: true,
    },
    {
      id: 'share-link',
      label: 'Share Link',
      description: 'Share via apps or copy',
      icon: <Share2 className="h-4 w-4 text-gray-500" />,
      onClick: handleShareLink,
      disabled: false,
    },
    {
      id: 'copy-link',
      label: 'Copy Link',
      description: 'Copy URL to clipboard',
      icon: <Copy className="h-4 w-4 text-gray-500" />,
      onClick: handleCopyLink,
      disabled: false,
    },
    {
      id: 'print-report',
      label: 'Print Report',
      description: 'Open browser print dialog',
      icon: <Printer className="h-4 w-4 text-gray-500" />,
      onClick: handlePrint,
      disabled: false,
    },
  ];

  return (
    <>
      {/* ── Action bar buttons ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* Share dropdown trigger */}
        <div ref={menuRef} className="relative">
          <button
            id="export-menu-trigger"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="true"
            aria-expanded={isOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer select-none"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* ── Desktop dropdown popover ──────────────────────────────── */}
          {isOpen && (
            <>
              {/* Mobile backdrop */}
              <div
                className="fixed inset-0 z-30 bg-black/30 sm:hidden"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown panel */}
              <div
                role="menu"
                className={`
                  z-40 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden
                  sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-64
                  fixed bottom-0 left-0 right-0 rounded-b-none sm:rounded-xl sm:bottom-auto sm:left-auto sm:right-0
                `}
              >
                {/* Mobile drag handle */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Mobile header */}
                <div className="sm:hidden flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Export & Share</span>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                {/* Items */}
                <div className="py-1.5">
                  {menuItems.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx === menuItems.length - 1 && (
                        <div className="mx-3 my-1 h-px bg-gray-100" />
                      )}
                      <button
                        role="menuitem"
                        type="button"
                        onClick={item.onClick}
                        disabled={item.disabled}
                        className={`
                          flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer
                          ${item.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}
                          ${item.highlight ? 'bg-blue-50/50' : ''}
                        `}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.highlight ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {item.icon}
                        </span>
                        <div>
                          <p className={`text-sm font-semibold ${item.highlight ? 'text-blue-700' : 'text-gray-800'}`}>
                            {item.label}
                            {item.id === 'download-pdf' && isPdfLoading && (
                              <span className="ml-2 text-xs font-normal text-blue-500">Generating…</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Bottom safe area on mobile */}
                <div className="sm:hidden h-safe-bottom pb-2" />
              </div>
            </>
          )}
        </div>

        {/* Print Report standalone button */}
        <button
          id="print-report-btn"
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Report</span>
        </button>
      </div>

      {/* ── Toast notification ─────────────────────────────────────────── */}
      <div
        className={`
          fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold
          transition-all duration-300
          ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}
          ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
        aria-live="polite"
      >
        <Check className="h-4 w-4 text-green-400 shrink-0" />
        {toast.message}
      </div>
    </>
  );
}
