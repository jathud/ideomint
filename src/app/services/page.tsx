import type { Metadata } from 'next';
import ServicesContent from '@/components/services/ServicesContent';

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description:
    'Ideomint helps businesses and people become clear, visible, and memorable through branding, content, social media, and personal brand growth. View our packages and pricing.',
  openGraph: {
    title: 'Services & Pricing | Ideomint',
    description:
      'Branding, social media, content creation, and personal brand growth packages for Sri Lankan businesses and creators.',
  },
};

export default function ServicesPage() {
  return <ServicesContent />;
}
