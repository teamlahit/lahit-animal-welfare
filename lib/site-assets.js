export const siteAssets = [
  { filename: 'rescue-hero-v2.webp', url: '/images/rescue-hero-v2.webp', category: 'hero', alt: 'A LAHIT volunteer caring for a rescued dog in Uttarakhand' },
  { filename: 'rescue-hero-v3.webp', url: '/images/rescue-hero-v3.webp', category: 'hero', alt: 'Volunteers caring for rescued dogs in Uttarakhand' },
  { filename: 'rescue-hero-v5.webp', url: '/images/rescue-hero-v5.webp', category: 'hero', alt: 'A veterinarian examining a rescued dog during a clinic check-up' },
  { filename: 'rescue-hero-v6.webp', url: '/images/rescue-hero-v6.webp', category: 'hero', alt: 'Veterinary staff providing medical treatment to a rescued animal' },
  { filename: 'lahit.png', url: '/lahit.png', category: 'general', alt: 'LAHIT logo' },
];

const siteAssetUrls = new Set(siteAssets.map((asset) => asset.url));

export function siteAssetUrl(url) {
  if (!siteAssetUrls.has(url)) return url;
  return `/api/site-assets/${url.slice(1)}`;
}
