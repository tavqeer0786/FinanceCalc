/**
 * pdfExport.ts — Client-side PDF generation engine for FinanceCalc
 *
 * Strategy: capture the full calculator page using html-to-image with print-mode
 * simulation (hide print:hidden elements, show print:block elements),
 * then paginate the resulting image into an A4 PDF.
 *
 * This produces a PDF that looks IDENTICAL to the browser's print output.
 * It also completely sidesteps Unicode/font embedding issues (₹, €, etc.)
 * because the text is rasterized directly by the browser engine.
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

  // Create a clone to manipulate styles for "print mode"
  const clone = element.cloneNode(true) as HTMLElement;

  // Apply print-specific display rules
  clone.querySelectorAll<HTMLElement>('[class*="print:hidden"]').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });
  clone.querySelectorAll<HTMLElement>('[class*="print:block"]').forEach(el => {
    el.style.setProperty('display', 'block', 'important');
  });
  clone.querySelectorAll<HTMLElement>('[class*="overflow-hidden"]').forEach(el => {
    el.style.overflow = 'visible';
  });

  // Append clone off-screen so styles apply correctly
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = `${element.scrollWidth}px`;
  clone.style.backgroundColor = '#ffffff';

  document.body.appendChild(clone);

  try {
    // Lazy-load libraries
    const [{ jsPDF }, { toJpeg }] = await Promise.all([
      import('jspdf'),
      import('html-to-image'),
    ]);

    // Render clone to JPEG. This captures all Unicode/fonts perfectly because
    // it uses the browser's own native rendering pipeline.
    const imgData = await toJpeg(clone, { 
      quality: 0.95, 
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });

    // A4 page dimensions in mm
    const PAGE_W_MM = 210;
    const PAGE_H_MM = 297;
    const MARGIN_MM = 10;
    const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
    const CONTENT_H_MM = PAGE_H_MM - MARGIN_MM * 2;

    // Calculate aspect ratio
    const clonePxW = clone.scrollWidth;
    const clonePxH = clone.scrollHeight;

    const fittedImgW = CONTENT_W_MM;
    const fittedImgH = (clonePxH / clonePxW) * fittedImgW;

    const totalPages = Math.ceil(fittedImgH / CONTENT_H_MM);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) doc.addPage();
      const yOffset = MARGIN_MM - page * CONTENT_H_MM;
      doc.addImage(imgData, 'JPEG', MARGIN_MM, yOffset, fittedImgW, fittedImgH);
    }

    const slug = calc.slug
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');

    doc.save(`FinanceCalc-${slug}-Report.pdf`);
  } finally {
    // Ensure clone is always removed
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
}
