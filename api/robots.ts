export default function handler(req: any, res: any) {
  const host = req.headers.host || 'financecalc-one.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

  res.status(200).send(`# Enterprise Robots Directives for FinanceCalc
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${protocol}://${host}/sitemap.xml
`);
}
