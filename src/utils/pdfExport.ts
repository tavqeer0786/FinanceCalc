/**
 * pdfExport.ts — Client-side PDF generation engine for FinanceCalc
 *
 * Strategy: capture the full calculator page using html-to-image with print-mode
 * simulation. We temporarily apply print styles to the live DOM so that
 * the library captures the exact print-ready layout (no hidden sidebars).
 *
 * This completely sidesteps Unicode/font embedding issues (₹, €, etc.)
 * because the text is rasterized directly by the browser engine.
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

  // We inject a temporary style to simulate print media query behavior on screen
  const styleId = 'pdf-export-style';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      .pdf-export-mode .print\\:hidden { display: none !important; }
      .pdf-export-mode .print\\:block { display: block !important; }
      .pdf-export-mode .overflow-hidden { overflow: visible !important; }
    `;
    document.head.appendChild(styleEl);
  }

  // 1. Enter PDF Export Mode on the live DOM
  element.classList.add('pdf-export-mode');

  try {
    // 2. Wait for React/browser layout to stabilize after class change
    await new Promise(resolve => setTimeout(resolve, 300));

    // Lazy-load libraries
    const [{ jsPDF }, { toJpeg }] = await Promise.all([
      import('jspdf'),
      import('html-to-image'),
    ]);

    // 3. Capture the live DOM which now accurately reflects the print view
    console.log('Capturing DOM for PDF...', element.scrollWidth, 'x', element.scrollHeight);
    if (element.scrollWidth === 0 || element.scrollHeight === 0) {
      throw new Error('Element has zero width or height');
    }

    const imgDataUrl = await toJpeg(element, { 
      quality: 0.95, 
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });

    if (!imgDataUrl || imgDataUrl === 'data:,') {
      throw new Error('Failed to capture image data');
    }
    console.log('DOM capture successful, building PDF...');

    // A4 page dimensions in mm
    const PAGE_W_MM = 210;
    const PAGE_H_MM = 297;
    const MARGIN_MM = 10;
    const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
    const CONTENT_H_MM = PAGE_H_MM - MARGIN_MM * 2;

    // We create an Image to read the actual pixel dimensions of the generated capture
    const img = new Image();
    img.src = imgDataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvasPxW = img.width;
    const canvasPxH = img.height;

    if (canvasPxW === 0 || canvasPxH === 0) {
      throw new Error('Rendered image has zero dimensions');
    }

    const fittedImgW = CONTENT_W_MM;
    const fittedImgH = (canvasPxH / canvasPxW) * fittedImgW;

    const totalPages = Math.ceil(fittedImgH / CONTENT_H_MM);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) doc.addPage();
      const yOffset = MARGIN_MM - page * CONTENT_H_MM;
      doc.addImage(imgDataUrl, 'JPEG', MARGIN_MM, yOffset, fittedImgW, fittedImgH);
    }

    const slug = calc.slug
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');

    doc.save(`FinanceCalc-${slug}-Report.pdf`);
    console.log('PDF generation complete');
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  } finally {
    // 4. Restore the live DOM back to normal screen view
    element.classList.remove('pdf-export-mode');
  }
}
