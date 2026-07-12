export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

  res.status(200).send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://financecalc-one.vercel.app/sitemap.xml
`);
}
