import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import StructuredData from '@/components/StructuredData';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { siteAssetUrl } from '@/lib/site-assets';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Animal Rescue in Uttarkashi, Uttarakhand`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['animal rescue Uttarkashi', 'animal welfare Uttarkashi', 'stray dog rescue Uttarkashi', 'animal rescue Uttarakhand', 'pet adoption Uttarakhand', 'animal welfare volunteer Uttarkashi'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'nonprofit',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  icons: {
    icon: siteAssetUrl('/lahit.png'),
    shortcut: siteAssetUrl('/lahit.png'),
    apple: siteAssetUrl('/lahit.png'),
  },
  openGraph: {
    title: 'LAHIT Animal Welfare | Animal Rescue in Uttarkashi, Uttarakhand',
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: { card: 'summary', title: SITE_NAME, description: SITE_DESCRIPTION },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="lahit">
      <body className="font-sans antialiased bg-base-200">
        <StructuredData />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
