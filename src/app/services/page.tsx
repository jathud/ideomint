import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { serviceGraph, breadcrumbs } from '@/lib/seo';
import ServicesContent from '@/components/services/ServicesContent';

export const metadata = pageMetadata('Services', 'Explore IdeoMint websites, marketing, content and creative services, brand identity and personal branding. Request a tailored proposal for your business.', '/services');

export default function ServicesPage() {
  return <><JsonLd data={[breadcrumbs('Services', '/services'), ...serviceGraph()]} /><ServicesContent /></>;
}
