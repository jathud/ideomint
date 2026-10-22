import type { Metadata } from 'next';

export const siteUrl = 'https://ideomint.com';
export const agencyDescription = 'IdeoMint is a creative and digital agency in Jaffna, Sri Lanka. We build websites, marketing campaigns, brand identities and content that help businesses stand out and grow.';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, siteUrl).href;
  const fullTitle = title.includes('IdeoMint') ? title : `${title} | IdeoMint`;
  return {
    title: { absolute: fullTitle }, description, alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'IdeoMint', title: fullTitle, description, url, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'IdeoMint creative and digital agency' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: ['/og-image.png'] },
  };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
};

export const organization = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': `${siteUrl}/#organization`,
  name: 'IdeoMint', url: siteUrl, description: agencyDescription,
  logo: `${siteUrl}/logo.png`, email: 'hello@ideomint.com', telephone: '+94786892649',
  address: { '@type': 'PostalAddress', addressLocality: 'Jaffna', addressCountry: 'LK' },
  sameAs: ['https://www.instagram.com/ideomint/', 'https://web.facebook.com/profile.php?id=61591030654944', 'https://www.linkedin.com/company/ideomint/'],
};

export const services = [
  { name: 'Websites', path: '/services#websites', description: 'Responsive websites and landing pages that build trust and support business enquiries.' },
  { name: 'Marketing', path: '/services#grow-presence', description: 'Social media, campaigns and digital marketing for business visibility.' },
  { name: 'Content & Creative', path: '/services#create-content', description: 'Photography, video, reels, brand identities and creative design.' },
];

export function serviceGraph() {
  return services.map(service => ({ '@context': 'https://schema.org', '@type': 'Service', '@id': `${siteUrl}${service.path}`, name: service.name, description: service.description, url: `${siteUrl}${service.path}`, provider: { '@id': `${siteUrl}/#organization` } }));
}

export function breadcrumbs(name: string, path: string) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'IdeoMint', item: siteUrl },
    { '@type': 'ListItem', position: 2, name, item: `${siteUrl}${path}` },
  ] };
}
