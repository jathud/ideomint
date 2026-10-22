import { pageMetadata } from '@/lib/seo';
import StudioPage from '@/components/ui/StudioPage';

export const metadata = pageMetadata('Careers & Collaborations', 'Introduce yourself to IdeoMint and share your creative, development, marketing or production portfolio.', '/careers');

export default function CareersPage() {
  return <StudioPage title="Good ideas start with people." intro="Interested in creating with IdeoMint? Introduce yourself and share the kind of work you would like to contribute."
    sections={[
      { title: 'Introduce yourself', text: 'Send a short introduction, your area of interest, a portfolio link and your availability to hello@ideomint.com. Design, development, marketing and production all contribute to the work we create.' },
      { title: 'A conversation, not a vacancy listing', text: 'This page is an invitation to connect, not an advertised job opening or a promise of employment. Any role, freelance scope or collaboration would be discussed and agreed separately.' },
      { title: 'Keep it simple', text: 'A few relevant examples and a clear description of your contribution are more useful than a long pitch. Please do not send sensitive identification documents with an introduction.' },
    ]} />;
}
