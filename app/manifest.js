import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { siteAssetUrl } from '@/lib/site-assets';

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: 'LAHIT',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f7f2',
    theme_color: '#0b3324',
    icons: [
      { src: siteAssetUrl('/lahit.png'), sizes: '192x192', type: 'image/png' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
