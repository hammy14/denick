import { Router } from 'express'

export default function seoRoutes() {
  const r = Router()

  r.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.BASE_URL || 'https://denick.com'
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    res.header('Content-Type', 'application/xml')
    res.header('Cache-Control', 'public, max-age=86400')
    res.send(sitemap)
  })

  r.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api`
    res.header('Content-Type', 'text/plain')
    res.header('Cache-Control', 'public, max-age=604800')
    res.send(robots)
  })

  return r
}
