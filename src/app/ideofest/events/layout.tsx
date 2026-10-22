import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('IdeoFest Events', 'Explore published IdeoFest events, dates, venues and ticket information.', '/ideofest/events');
export default function PublicEventsLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
