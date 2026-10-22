import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { serviceGraph, breadcrumbs } from '@/lib/seo';
import ServicesContent from '@/components/services/ServicesContent';

export const metadata = pageMetadata('Services & Pricing', 'Explore IdeoMint websites, marketing, content and creative services, plus brand identity and personal branding packages.', '/services');

export default function ServicesPage() {
  return <><JsonLd data={[breadcrumbs('Services & Pricing', '/services'), ...serviceGraph()]} /><ServicesContent /></>;
}
