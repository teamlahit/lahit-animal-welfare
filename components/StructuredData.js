import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { siteAssetUrl } from '@/lib/site-assets';

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}${siteAssetUrl('/lahit.png')}`,
        description: SITE_DESCRIPTION,
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Uttarkashi, Uttarakhand, India' },
          { '@type': 'AdministrativeArea', name: 'Uttarakhand, India' },
        ],
        knowsAbout: ['animal rescue', 'animal welfare', 'pet adoption', 'stray animal care'],
        sameAs: [
          'https://facebook.com/lahitanimalwelfare',
          'https://instagram.com/lahit_animals',
          'https://youtube.com/@lahitanimalwelfare',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
