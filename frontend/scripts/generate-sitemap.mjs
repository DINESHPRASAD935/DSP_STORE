import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://mrdsphub.in';
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.mrdsphub.in/api';

const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');

const staticUrls = [
  { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
  { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.6' },
  { loc: `${SITE_URL}/legal/privacy`, changefreq: 'monthly', priority: '0.4' },
  { loc: `${SITE_URL}/legal/terms`, changefreq: 'monthly', priority: '0.4' },
  { loc: `${SITE_URL}/legal/disclaimer`, changefreq: 'monthly', priority: '0.4' },
];

async function fetchAllProductsBestEffort() {
  try {
    const url = `${API_BASE_URL}/products/?page=1&page_size=500`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const payload = await res.json();
    const list = Array.isArray(payload) ? payload : payload.results || [];
    return list.filter((p) => p && typeof p.id === 'number');
  } catch {
    return [];
  }
}

async function fetchAllBlogPostsBestEffort() {
  try {
    const url = `${API_BASE_URL}/blog-posts/?page=1&page_size=500`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const payload = await res.json();
    const list = Array.isArray(payload) ? payload : payload.results || [];
    return list.filter((p) => p && typeof p.slug === 'string' && p.slug.length > 0);
  } catch {
    return [];
  }
}

function toXml(urls) {
  const nodes = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : '';
      return `<url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>${lastmod}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nodes}</urlset>`;
}

const products = await fetchAllProductsBestEffort();
const productUrls = products.map((p) => ({
  loc: `${SITE_URL}/product/${p.id}`,
  changefreq: 'weekly',
  priority: '0.8',
  lastmod: p.updated_at || p.created_at,
}));

const blogPosts = await fetchAllBlogPostsBestEffort();
const blogUrls = blogPosts.map((p) => ({
  loc: `${SITE_URL}/blog/${p.slug}`,
  changefreq: 'weekly',
  priority: '0.7',
  lastmod: p.updated_at || p.published_at || p.created_at,
}));

const xml = toXml([...staticUrls, ...productUrls, ...blogUrls]);
await fs.writeFile(outputPath, xml, 'utf8');
console.log(`Generated sitemap.xml: ${staticUrls.length + productUrls.length + blogUrls.length} urls`);

