/**
 * pdfExport.ts — Client-side PDF generation engine for FinanceCalc
 *
 * Strategy: capture the full calculator page using html2canvas with print-mode
 * simulation (hide print:hidden elements, show print:block elements),
 * then paginate the resulting image into an A4 PDF.
 *
 * This produces a PDF that looks IDENTICAL to the browser's print output.
 * Both libraries are lazy-loaded — zero impact on initial bundle size.
 */

import type { RefObject } from 'react';
import { CalculatorDef } from '../types';

export interface PdfReportOptions {
  calc: CalculatorDef;
  pageRef: RefObject<HTMLDivElement | null>;
}

/** Generate and auto-download a PDF matching the print layout exactly */
export async function generatePdfReport(opts: PdfReportOptions): Promise<void> {
  const { calc, pageRef } = opts;

  const element = pageRef.current;
  if (!element) throw new Error('Page ref not attached');

  // Lazy-load both libraries
  const [{ jsPDF }, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas').then(m => m.default),
  ]);

  // A4 page dimensions in mm
  const PAGE_W_MM = 210;
  const PAGE_H_MM = 297;
  const MARGIN_MM = 10;
  const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
  const CONTENT_H_MM = PAGE_H_MM - MARGIN_MM * 2;

  const SCALE = 2; // Retina quality

  // ── Capture the page, simulating print mode via onclone ──────────────────
  const canvas = await html2canvas(element, {
    scale: SCALE,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
    // Capture the full scrollable height, not just the viewport
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    onclone: (_clonedDoc: Document, clonedElement: Element) => {
      // ① Hide elements that are hidden during print (print:hidden)
      clonedElement.querySelectorAll<HTMLElement>('[class*="print:hidden"]').forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });

      // ② Show elements that are only visible during print (hidden print:block)
      clonedElement.querySelectorAll<HTMLElement>('[class*="print:block"]').forEach(el => {
        el.style.setProperty('display', 'block', 'important');
      });

      // ③ Remove any overflow hidden that might clip content
      clonedElement.querySelectorAll<HTMLElement>('[class*="overflow-hidden"]').forEach(el => {
        el.style.overflow = 'visible';
      });
    },
  });

  // ── Build A4 PDF, paginating the canvas across pages ────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // Scale canvas to fit A4 content width
  const canvasPxW = canvas.width;
  const canvasPxH = canvas.height;

  // Width in mm when fitted to content area
  const fittedImgW = CONTENT_W_MM;
  const fittedImgH = (canvasPxH / canvasPxW) * fittedImgW;

  // How many A4 pages we need
  const totalPages = Math.ceil(fittedImgH / CONTENT_H_MM);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage();

    // Position the image so the correct slice falls within this page
    const yOffset = MARGIN_MM - page * CONTENT_H_MM;
    doc.addImage(imgData, 'JPEG', MARGIN_MM, yOffset, fittedImgW, fittedImgH);
  }

  // ── File name: FinanceCalc-Emi-Calculator-Report.pdf ────────────────────
  const slug = calc.slug
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');

  doc.save(`FinanceCalc-${slug}-Report.pdf`);
}
