/**
 * pdfExport.ts — Client-side PDF generation engine for FinanceCalc
 * Uses jsPDF + html2canvas, both lazy-loaded to protect initial bundle size.
 */

import type { RefObject } from 'react';
import { Currency } from '../data/currencyData';
import { CalculatorDef, CalculatorResult } from '../types';

export interface PdfReportOptions {
  calc: CalculatorDef;
  result: CalculatorResult;
  resultB?: CalculatorResult;
  comparisonMode: boolean;
  formInputs: Record<string, any>;
  formInputsB?: Record<string, any>;
  currency: Currency;
  formatValue: (value: number) => string;
  formatSummary: (value: string | number) => string;
  chartRef?: RefObject<HTMLDivElement | null>;
}

// Plain RGB type — avoids const-tuple spreading issues
type RGB = [number, number, number];

// Colour palette
const C_BRAND_BLUE:   RGB = [37,  99,  235];
const C_BRAND_GRAY:   RGB = [100, 116, 139];
const C_LIGHT_GRAY:   RGB = [248, 250, 252];
const C_BORDER_GRAY:  RGB = [226, 232, 240];
const C_TEXT_DARK:    RGB = [15,  23,  42 ];
const C_TEXT_MID:     RGB = [71,  85,  105];
const C_SUCCESS:      RGB = [22,  163, 74 ];
const C_WHITE:        RGB = [255, 255, 255];
const C_BLUE_LIGHT:   RGB = [186, 211, 254];
const C_AMBER_DARK:   RGB = [146, 64,  14 ];
const C_AMBER_MID:    RGB = [120, 53,  15 ];

/** Generate and auto-download a PDF report */
export async function generatePdfReport(opts: PdfReportOptions): Promise<void> {
  // Lazy-load both libraries — zero impact on initial bundle
  const [{ jsPDF }, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas').then(m => m.default),
  ]);

  const {
    calc, result, resultB, comparisonMode,
    formInputs, formInputsB, currency,
    formatValue, formatSummary, chartRef,
  } = opts;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 16;
  const marginR = 16;
  const contentW = pageW - marginL - marginR;
  let y = 0;

  // ─── Helper utilities ────────────────────────────────────────────────────

  const rgb = (c: RGB) => ({ r: c[0], g: c[1], b: c[2] });

  const setFont = (size: number, style: 'normal' | 'bold' = 'normal', color: RGB = C_TEXT_DARK) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const drawLine = (yPos: number, color: RGB = C_BORDER_GRAY) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.3);
    doc.line(marginL, yPos, pageW - marginR, yPos);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageH - 20) {
      doc.addPage();
      y = 16;
      drawFooter();
    }
  };

  const drawFooter = () => {
    const pageNum = doc.getNumberOfPages();
    setFont(7, 'normal', C_BRAND_GRAY);
    doc.text('financecalc.com', marginL, pageH - 8);
    doc.text(
      `Page ${pageNum}  •  Generated ${new Date().toLocaleString()}  •  For educational purposes only`,
      pageW / 2, pageH - 8, { align: 'center' }
    );
    doc.text(calc.name, pageW - marginR, pageH - 8, { align: 'right' });
  };

  const sectionHeading = (title: string) => {
    checkPageBreak(14);
    y += 4;
    const c = rgb(C_BRAND_BLUE);
    doc.setFillColor(c.r, c.g, c.b);
    doc.roundedRect(marginL, y, contentW, 8, 1, 1, 'F');
    setFont(9, 'bold', C_WHITE);
    doc.text(title.toUpperCase(), marginL + 4, y + 5.5);
    y += 12;
  };

  // ─── PAGE 1: HEADER ──────────────────────────────────────────────────────

  const hc = rgb(C_BRAND_BLUE);
  doc.setFillColor(hc.r, hc.g, hc.b);
  doc.rect(0, 0, pageW, 38, 'F');

  setFont(22, 'bold', C_WHITE);
  doc.text('FinanceCalc', marginL, 17);

  setFont(8, 'normal', C_BLUE_LIGHT);
  doc.text('Free Financial Calculators · financecalc.com', marginL, 23);

  setFont(7, 'bold', C_BLUE_LIGHT);
  doc.text('FINANCIAL REPORT', pageW - marginR, 12, { align: 'right' });
  setFont(13, 'bold', C_WHITE);
  doc.text(calc.name, pageW - marginR, 22, { align: 'right' });

  y = 44;

  // Meta info row
  const lgc = rgb(C_LIGHT_GRAY);
  doc.setFillColor(lgc.r, lgc.g, lgc.b);
  doc.roundedRect(marginL, y, contentW, 16, 2, 2, 'F');
  drawLine(y + 16);

  const metaItems: [string, string][] = [
    ['Generated', new Date().toLocaleString()],
    ['Currency', `${currency.flag} ${currency.code} — ${currency.name}`],
    ['Mode', comparisonMode ? 'Scenario Comparison (A vs B)' : 'Standard'],
  ];
  const colW = contentW / metaItems.length;
  metaItems.forEach(([label, val], i) => {
    const x = marginL + i * colW + 3;
    setFont(6.5, 'bold', C_BRAND_GRAY);
    doc.text(label.toUpperCase(), x, y + 5.5);
    setFont(7.5, 'normal', C_TEXT_DARK);
    doc.text(val, x, y + 12);
  });
  y += 22;

  // ─── INPUTS SUMMARY ──────────────────────────────────────────────────────

  sectionHeading('Input Parameters');

  const inputsToRender = comparisonMode
    ? calc.inputs.map(inp => ({
        label: inp.name,
        valA: String(formInputs[inp.id] ?? inp.defaultValue) + (inp.unit ? ` ${inp.unit}` : ''),
        valB: String((formInputsB ?? formInputs)[inp.id] ?? inp.defaultValue) + (inp.unit ? ` ${inp.unit}` : ''),
      }))
    : calc.inputs.map(inp => ({
        label: inp.name,
        val: String(formInputs[inp.id] ?? inp.defaultValue) + (inp.unit ? ` ${inp.unit}` : ''),
      }));

  const rowH = 7;
  if (comparisonMode) {
    const bgc = rgb(C_BORDER_GRAY);
    doc.setFillColor(bgc.r, bgc.g, bgc.b);
    doc.rect(marginL, y, contentW, 6, 'F');
    const col1 = contentW * 0.4;
    const col2 = (contentW - col1) / 2;
    setFont(7, 'bold', C_TEXT_MID);
    doc.text('Parameter', marginL + 3, y + 4.2);
    doc.text('Scenario A', marginL + col1 + 3, y + 4.2);
    doc.text('Scenario B', marginL + col1 + col2 + 3, y + 4.2);
    y += 6;

    inputsToRender.forEach((row: any, i: number) => {
      checkPageBreak(rowH + 2);
      if (i % 2 === 0) {
        const c = rgb(C_LIGHT_GRAY);
        doc.setFillColor(c.r, c.g, c.b);
        doc.rect(marginL, y, contentW, rowH, 'F');
      }
      setFont(7.5, 'bold', C_TEXT_DARK);
      doc.text(row.label, marginL + 3, y + 5);
      setFont(7.5, 'normal', C_TEXT_MID);
      doc.text(row.valA, marginL + col1 + 3, y + 5);
      setFont(7.5, 'bold', C_BRAND_BLUE);
      doc.text(row.valB, marginL + col1 + col2 + 3, y + 5);
      y += rowH;
    });
  } else {
    const half = contentW / 2;
    inputsToRender.forEach((row: any, i: number) => {
      const isLeft = i % 2 === 0;
      const xOff = isLeft ? marginL : marginL + half + 2;
      if (isLeft) {
        checkPageBreak(rowH + 2);
        if (Math.floor(i / 2) % 2 === 0) {
          const c = rgb(C_LIGHT_GRAY);
          doc.setFillColor(c.r, c.g, c.b);
          doc.rect(marginL, y, contentW, rowH, 'F');
        }
      }
      setFont(7, 'bold', C_BRAND_GRAY);
      doc.text(row.label, xOff + 2, y + 3.5);
      setFont(8, 'normal', C_TEXT_DARK);
      doc.text(row.val ?? '', xOff + 2, y + 7.5);
      if (!isLeft || i === inputsToRender.length - 1) y += rowH + 3;
    });
  }
  y += 4;

  // ─── RESULTS ─────────────────────────────────────────────────────────────

  sectionHeading(comparisonMode ? 'Results — Scenario Comparison' : 'Calculation Results');

  if (!comparisonMode) {
    result.summary.forEach((item, i) => {
      checkPageBreak(12);
      const isFirst = i === 0;
      if (isFirst) {
        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(C_BRAND_BLUE[0], C_BRAND_BLUE[1], C_BRAND_BLUE[2]);
      } else {
        const fc = rgb(C_LIGHT_GRAY);
        doc.setFillColor(fc.r, fc.g, fc.b);
        doc.setDrawColor(C_BORDER_GRAY[0], C_BORDER_GRAY[1], C_BORDER_GRAY[2]);
      }
      doc.setLineWidth(0.4);
      doc.roundedRect(marginL, y, contentW, 10, 1.5, 1.5, 'FD');
      setFont(7, 'bold', C_BRAND_GRAY);
      doc.text(item.label.toUpperCase(), marginL + 4, y + 4.5);
      const displayVal = formatSummary(item.value);
      setFont(isFirst ? 11 : 9, 'bold', isFirst ? C_BRAND_BLUE : C_TEXT_DARK);
      doc.text(displayVal, pageW - marginR - 4, y + 7, { align: 'right' });
      y += 12;
    });
  } else {
    const col1 = contentW * 0.36;
    const col2 = (contentW - col1) / 3;
    const hbc = rgb(C_BORDER_GRAY);
    doc.setFillColor(hbc.r, hbc.g, hbc.b);
    doc.rect(marginL, y, contentW, 6, 'F');
    setFont(7, 'bold', C_TEXT_MID);
    doc.text('Metric', marginL + 3, y + 4.2);
    doc.text('Scenario A', marginL + col1 + 3, y + 4.2);
    doc.text('Scenario B', marginL + col1 + col2 + 3, y + 4.2);
    doc.text('Difference', marginL + col1 + col2 * 2 + 3, y + 4.2);
    y += 6;

    result.summary.forEach((item, i) => {
      checkPageBreak(8);
      const valA = item.value;
      const valB = resultB?.summary[i]?.value ?? valA;
      const numA = Number(String(valA).replace(/[^0-9.-]/g, '')) || 0;
      const numB = Number(String(valB).replace(/[^0-9.-]/g, '')) || 0;
      const diff = numB - numA;
      const isPercent = String(valA).includes('%');
      const diffText = diff === 0
        ? '—'
        : `${diff > 0 ? '+' : ''}${isPercent ? `${diff.toFixed(2)}%` : formatValue(Math.abs(diff))}`;
      const diffColor: RGB = diff > 0 ? C_SUCCESS : diff < 0 ? [220, 38, 38] : C_TEXT_MID;

      if (i % 2 === 0) {
        const rc = rgb(C_LIGHT_GRAY);
        doc.setFillColor(rc.r, rc.g, rc.b);
        doc.rect(marginL, y, contentW, 7, 'F');
      }
      setFont(7.5, 'bold', C_TEXT_DARK);
      doc.text(item.label, marginL + 3, y + 5);
      setFont(7.5, 'normal', C_TEXT_MID);
      doc.text(formatSummary(valA), marginL + col1 + 3, y + 5);
      setFont(7.5, 'bold', C_BRAND_BLUE);
      doc.text(formatSummary(valB), marginL + col1 + col2 + 3, y + 5);
      setFont(7.5, 'bold', diffColor);
      doc.text(diffText, marginL + col1 + col2 * 2 + 3, y + 5);
      y += 7;
    });
  }
  y += 6;

  // ─── CHART IMAGE ─────────────────────────────────────────────────────────

  if (chartRef?.current) {
    try {
      checkPageBreak(8);
      sectionHeading('Charts & Visualizations');
      checkPageBreak(80);

      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const aspectRatio = canvas.width / canvas.height;
      const imgW = contentW;
      const imgH = Math.min(imgW / aspectRatio, 100);
      checkPageBreak(imgH + 4);
      doc.addImage(imgData, 'JPEG', marginL, y, imgW, imgH);
      y += imgH + 8;
    } catch (_e) {
      // Silent fallback: skip chart image, continue with table
      y += 4;
    }
  }

  // ─── DATA TABLE ──────────────────────────────────────────────────────────

  const charts = result.charts;

  if (charts?.amortization && charts.amortization.length > 0) {
    sectionHeading('Amortization Schedule');
    const headers = ['Year', 'Annual Payment', 'Principal Paid', 'Interest Paid', 'Balance'];
    const rows = charts.amortization.map(r => [
      `Yr ${r.period}`,
      formatValue(Math.round(r.payment)),
      formatValue(Math.round(r.principal)),
      formatValue(Math.round(r.interest)),
      formatValue(Math.round(r.remainingBalance)),
    ]);
    y = drawPdfTable(doc, headers, rows, { y, marginL, contentW, checkPageBreak });
  } else if (charts?.growth && charts.growth.length > 0) {
    sectionHeading('Investment Growth Schedule');
    const headers = ['Year', 'Invested', 'Returns', 'Total Value'];
    const rows = charts.growth.map(r => [
      `Yr ${r.year}`,
      formatValue(Math.round(r.invested)),
      formatValue(Math.round(r.interest)),
      formatValue(Math.round(r.total)),
    ]);
    y = drawPdfTable(doc, headers, rows, { y, marginL, contentW, checkPageBreak });
  } else if (charts?.brackets && charts.brackets.length > 0) {
    sectionHeading('Tax Bracket Breakdown');
    const headers = ['Bracket', 'Range', 'Taxable Income', 'Tax Amount'];
    const rows = charts.brackets.map(r => [
      `${r.rate}%`,
      r.range,
      formatValue(Math.round(r.taxableIncome)),
      formatValue(Math.round(r.taxAmount)),
    ]);
    y = drawPdfTable(doc, headers, rows, { y, marginL, contentW, checkPageBreak });
  }

  // ─── DISCLAIMER ──────────────────────────────────────────────────────────

  checkPageBreak(28);
  y += 6;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginL, y, contentW, 22, 2, 2, 'FD');
  setFont(8, 'bold', C_AMBER_DARK);
  doc.text('Disclaimer', marginL + 4, y + 7);
  setFont(7, 'normal', C_AMBER_MID);
  const disclaimer = doc.splitTextToSize(
    'This report is generated by FinanceCalc and is intended for educational and planning purposes only. ' +
    'It does not constitute financial advice. Always consult a qualified financial advisor before making ' +
    'investment, loan, or tax decisions. Results are based on the inputs provided and may differ from ' +
    'actual financial outcomes.',
    contentW - 8
  );
  doc.text(disclaimer, marginL + 4, y + 13);
  y += 26;

  // ─── FINALIZE: footer on every page ──────────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter();
  }

  // Build filename: FinanceCalc-Emi-Calculator-Report.pdf
  const slug = calc.slug
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
  doc.save(`FinanceCalc-${slug}-Report.pdf`);
}

// ─── Internal table renderer ─────────────────────────────────────────────────

interface TableOpts {
  y: number;
  marginL: number;
  contentW: number;
  checkPageBreak: (h: number) => void;
}

function drawPdfTable(
  doc: any,
  headers: string[],
  rows: string[][],
  opts: TableOpts
): number {
  const { y: startY, marginL, contentW, checkPageBreak } = opts;
  const colW = contentW / headers.length;
  const rowH = 6.5;
  let cy = startY;

  // Header row
  doc.setFillColor(37, 99, 235);
  doc.rect(marginL, cy, contentW, 7, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => {
    doc.text(h, marginL + i * colW + 3, cy + 5);
  });
  cy += 7;

  rows.forEach((row, ri) => {
    checkPageBreak(rowH + 2);
    if (ri % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginL, cy, contentW, rowH, 'F');
    }
    doc.setFontSize(7);
    doc.setFont('helvetica', ri === rows.length - 1 ? 'bold' : 'normal');
    row.forEach((cell, ci) => {
      if (ci === 0) doc.setTextColor(15, 23, 42);
      else doc.setTextColor(71, 85, 105);
      doc.text(String(cell), marginL + ci * colW + 3, cy + 4.8);
    });
    cy += rowH;
  });

  return cy + 8;
}
