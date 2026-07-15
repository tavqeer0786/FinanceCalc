import { allCalculators } from '../src/calculators/index.js';
import { blogPosts } from '../src/data/blog.js';

// ============================================================
// Dynamic Sitemap Generator — Vercel Serverless Function
// Reads from allCalculators and blogPosts registries at runtime.
// Supports categorization query params (?type=pages|calculators|blogs|index)
// ============================================================

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

export default function handler(req: any, res: any) {
  const host = req.headers.host || 'financecalc-one.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const BASE_URL = `${protocol}://${host}`;

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

  // Read query parameters
  const { type } = req.query || {};

  // If a sitemap index is explicitly requested, serve the directory of split sitemaps
  if (type === 'index') {
    let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    indexXml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    indexXml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml?type=pages</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml?type=calculators</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml?type=blogs</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    indexXml += `</sitemapindex>`;
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(indexXml);
  }

  // ── 1. Static / Index Pages ──────────────────────────────
  if (!type || type === 'pages') {
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
  }

  // ── 2. Calculator Pages (from allCalculators registry) ───
  if (!type || type === 'calculators') {
    for (const calc of allCalculators) {
      if (calc.slug) {
        addEntry(`/${calc.slug}`, today, 'monthly', '0.9');
      }
    }
  }

  // ── 3. Blog Posts (from blogPosts registry) ──────────────
  if (!type || type === 'blogs') {
    for (const post of blogPosts) {
      if (post.slug) {
        addEntry(`/blog/${post.slug}`, toISODate(post.publishedAt), 'weekly', '0.8');
      }
    }
  }

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
