import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Since we may run in CJS or ESM, derive directory names safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import calculator and blog structures for dynamic SEO meta injection
import { allCalculators } from './src/calculators/index.js';
import { blogPosts } from './src/data/blog.js';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';
  const APP_URL = process.env.APP_URL || 'https://financecalc.com';
  let cachedIndexHtml: string | null = null;

  // 1. Robots.txt Route
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${APP_URL}/sitemap.xml
`);
  });

  // 2. Sitemap.xml Route
  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      '',
      '/about',
      '/contact',
      '/blog',
      '/privacy-policy',
      '/terms-of-service',
      '/disclaimer',
      '/editorial-policy'
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static pages
    staticPages.forEach(p => {
      sitemap += `
  <url>
    <loc>${APP_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Calculator pages
    allCalculators.forEach(calc => {
      sitemap += `
  <url>
    <loc>${APP_URL}/${calc.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // Blog pages
    blogPosts.forEach(post => {
      sitemap += `
  <url>
    <loc>${APP_URL}/blog/${post.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `\n</urlset>`;
    res.send(sitemap);
  });

  // 3. API Health Route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files with caching
    app.use(express.static(path.join(process.cwd(), 'dist'), {
      maxAge: '1d',
      index: false
    }));
  }

  // 4. Fallback Routing with HTML Pre-rendering and SEO Meta Tag Injections
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template: string;
      if (!isProd) {
        template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        if (!cachedIndexHtml) {
          cachedIndexHtml = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
        }
        template = cachedIndexHtml;
      }

      const staticPages = [
        '',
        '/',
        '/about',
        '/contact',
        '/blog',
        '/privacy-policy',
        '/terms-of-service',
        '/disclaimer',
        '/editorial-policy'
      ];
      const cleanPathname = url.split('?')[0];
      const isValidStatic = staticPages.includes(cleanPathname);
      
      let isValidBlog = false;
      if (cleanPathname.startsWith('/blog/')) {
        const blogSlug = cleanPathname.substring(6);
        isValidBlog = blogPosts.some(p => p.slug === blogSlug);
      }
      
      const calcSlug = cleanPathname.substring(1);
      const isValidCalc = allCalculators.some(c => c.slug === calcSlug);
      
      const isRouteFound = isValidStatic || isValidBlog || isValidCalc;

      // Initialize default SEO tags
      let title = 'FinanceCalc | Professional Financial Calculators Platform';
      let description = 'Calculate EMIs, compound interest, investment SIPs, taxes, and salary payouts instantly. 100% free, trustworthy financial planning calculators.';
      let canonical = `${APP_URL}${url}`;
      let extraHead = '';

      // Match path against custom pages, calculators, and blog posts
      if (url === '/' || url === '') {
        title = 'FinanceCalc | Trustworthy Financial Calculators & Planning';
        description = 'Access 26+ fast, professional, and free financial calculators. Plan home mortgages, mutual fund SIPs, income tax brackets, loans, and retirement wealth.';
      } else if (url === '/about') {
        title = 'About Us | FinanceCalc - Trusted Financial Engineering';
        description = 'Discover the mission, editorial standards, and mathematical models powering FinanceCalc\'s production-grade financial calculators.';
      } else if (url === '/contact') {
        title = 'Contact & Support | FinanceCalc';
        description = 'Get in touch with the FinanceCalc product team for feedback, calculator requests, and corporate partnerships.';
      } else if (url === '/blog') {
        title = 'Finance Insights & Expert Articles | FinanceCalc Blog';
        description = 'Stay ahead with masterclasses on compound interest, mortgage preparation, tax optimization, and budgeting from certified financial planners.';
      } else if (url.startsWith('/blog/')) {
        const slug = url.replace('/blog/', '').split('?')[0];
        const post = blogPosts.find(p => p.slug === slug);
        if (post) {
          title = `${post.title} | FinanceCalc Insights`;
          description = post.excerpt;
          
          // Schema for Article / BlogPost
          const blogSchema = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            'headline': post.title,
            'description': post.excerpt,
            'datePublished': post.publishedAt,
            'author': {
              '@type': 'Person',
              'name': post.author.name,
              'jobTitle': post.author.role
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'FinanceCalc',
              'logo': {
                '@type': 'ImageObject',
                'url': `${APP_URL}/favicon.ico`
              }
            },
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': canonical
            }
          };

          extraHead += `\n    <script type="application/ld+json">${JSON.stringify(blogSchema)}</script>`;
        }
      } else {
        // Check if path matches a calculator slug
        const slug = url.substring(1).split('?')[0];
        const calc = allCalculators.find(c => c.slug === slug);
        if (calc) {
          title = calc.seoTitle || `${calc.name} - Free Calculator | FinanceCalc`;
          description = calc.seoDescription || calc.description;

          // Breadcrumb Schema
          const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': APP_URL
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': calc.name,
                'item': canonical
              }
            ]
          };

          extraHead += `\n    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;

          // FAQ Schema if FAQ is present
          if (calc.faqs && calc.faqs.length > 0) {
            const faqSchema = {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              'mainEntity': calc.faqs.map(f => ({
                '@type': 'Question',
                'name': f.question,
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': f.answer
                }
              }))
            };
            extraHead += `\n    <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
          }
        }
      }

      // Base SEO schemas for website and organization (homepage only or global)
      const baseOrgSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'FinanceCalc',
        'url': APP_URL,
        'logo': `${APP_URL}/favicon.ico`,
        'sameAs': []
      };

      const baseWebSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'FinanceCalc',
        'url': APP_URL,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${APP_URL}/#search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };

      extraHead += `\n    <script type="application/ld+json">${JSON.stringify(baseOrgSchema)}</script>`;
      extraHead += `\n    <script type="application/ld+json">${JSON.stringify(baseWebSchema)}</script>`;

      // Generate generic OpenGraph + Twitter Meta tags
      extraHead += `
    <link rel="canonical" href="${canonical}" />
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80" />
      `;

      // Inject into template head
      let html = template
        .replace('<title>FinanceCalc - Free Financial Calculators, EMI, SIP, Loan & Investment Tools</title>', `<title>${title}</title>`)
        .replace('</head>', `${extraHead}\n  </head>`);

      res.status(isRouteFound ? 200 : 404).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinanceCalc server running in ${isProd ? 'production' : 'development'} at http://0.0.0.0:${PORT}`);
  });
}

startServer();
