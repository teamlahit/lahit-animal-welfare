import { SITE_URL } from '@/lib/site';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: ['/','/api/site-assets/'], disallow: ['/admin/', '/candidate/', '/login/', '/api/'] },
      { userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'], allow: ['/','/api/site-assets/'], disallow: ['/admin/', '/candidate/', '/login/', '/api/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
