import { allCalculators } from '../src/calculators/index.js';
import { blogPosts } from '../src/data/blog.js';

// ============================================================
// Dynamic Sitemap Generator — Vercel Serverless Function
// Reads from allCalculators and blogPosts registries at runtime.
// Automatically discovers glossary, guides, comparisons,
// checklists, and FAQs data files when they exist.
// ============================================================

const BASE_URL = 'https://financecalc-one.vercel.app';

/** Escape XML special characters in URLs and text */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

/** Parse human-readable date strings to ISO date (YYYY-MM-DD) */
function toISODate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (_) {}
  return new Date().toISOString().split('T')[0];
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/** Try to dynamically load a data module with slugs */
function tryLoadSlugs(modulePath: string): string[] {
  try {
    // Dynamic require — will only succeed if the file exists
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(modulePath);
    // Look for any exported array containing objects with slug property
    for (const key of Object.keys(mod)) {
      const val = mod[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0]?.slug === 'string') {
        return val.map((item: { slug: string }) => item.slug);
      }
    }
  } catch (_) {
    // Module doesn't exist — that's fine, return empty
  }
  return [];
}

export default function handler(req: any, res: any) {
  const today = new Date().toISOString().split('T')[0];
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();

  /** Add a URL entry, deduplicating by loc */
  function addEntry(path: string, lastmod: string, changefreq: string, priority: string) {
    const loc = path === '/' ? `${BASE_URL}/` : `${BASE_URL}${path}`;
    if (!seen.has(loc)) {
      seen.add(loc);
      entries.push({ loc, lastmod, changefreq, priority });
    }
  }

  // ── 1. Static / Index Pages ──────────────────────────────
  addEntry('/', today, 'weekly', '1.0');
  addEntry('/about', today, 'monthly', '0.8');
  addEntry('/contact', today, 'monthly', '0.8');
  addEntry('/privacy-policy', today, 'monthly', '0.8');
  addEntry('/terms-of-service', today, 'monthly', '0.8');
  addEntry('/disclaimer', today, 'monthly', '0.8');
  addEntry('/blog', today, 'weekly', '0.8');
  addEntry('/guides', today, 'weekly', '0.8');
  addEntry('/glossary', today, 'weekly', '0.8');
  addEntry('/calculators', today, 'weekly', '0.8');
  addEntry('/faq', today, 'weekly', '0.8');

  // ── 2. Calculator Pages (from allCalculators registry) ───
  for (const calc of allCalculators) {
    if (calc.slug) {
      addEntry(`/${calc.slug}`, today, 'monthly', '0.9');
    }
  }

  // ── 3. Blog Posts (from blogPosts registry) ──────────────
  for (const post of blogPosts) {
    if (post.slug) {
      addEntry(`/blog/${post.slug}`, toISODate(post.publishedAt), 'weekly', '0.8');
    }
  }

  // ── 4. Glossary Pages (when data file exists) ────────────
  try {
    const glossarySlugs = tryLoadSlugs('../src/data/glossary');
    for (const slug of glossarySlugs) {
      addEntry(`/glossary/${slug}`, today, 'monthly', '0.7');
    }
  } catch (_) {}

  // ── 5. Guides (when data file exists) ────────────────────
  try {
    const guidesSlugs = tryLoadSlugs('../src/data/guides');
    for (const slug of guidesSlugs) {
      addEntry(`/guides/${slug}`, today, 'weekly', '0.8');
    }
  } catch (_) {}

  // ── 6. Comparisons (when data file exists) ───────────────
  try {
    const compSlugs = tryLoadSlugs('../src/data/comparisons');
    for (const slug of compSlugs) {
      addEntry(`/comparisons/${slug}`, today, 'weekly', '0.8');
    }
  } catch (_) {}

  // ── 7. Checklists (when data file exists) ────────────────
  try {
    const checkSlugs = tryLoadSlugs('../src/data/checklists');
    for (const slug of checkSlugs) {
      addEntry(`/checklists/${slug}`, today, 'weekly', '0.8');
    }
  } catch (_) {}

  // ── 8. FAQs (when data file exists) ──────────────────────
  try {
    const faqSlugs = tryLoadSlugs('../src/data/faqs');
    for (const slug of faqSlugs) {
      addEntry(`/faq/${slug}`, today, 'monthly', '0.7');
    }
  } catch (_) {}

  // ── Generate XML ─────────────────────────────────────────
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(xml);
}
