import type { Metadata } from 'next';
import StudioPage from '@/components/ui/StudioPage';

export const metadata: Metadata = { title: 'Terms of Service', alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return <StudioPage title="Working with IdeoMint" intro="A clear brief and an agreed scope are the starting point for every project. These website notes explain the enquiry process; your written proposal or project agreement sets out the terms of your commissioned work."
    sections={[
      { title: 'Enquiries and proposals', text: 'Sending an enquiry starts a conversation. It does not confirm a booking, reserve a production date or begin a project. We confirm the scope, deliverables, timeline and fees with you before work begins.' },
      { title: 'Packages and additional costs', text: 'Published packages describe a starting scope. Your written quote confirms the final price and what is included. Advertising spend, travel, printing, hosting and third-party costs are separate unless included in writing. See the Services page for current packages and working terms.' },
      { title: 'Feedback and changes', text: 'Revision allowances, approval milestones and client-supplied materials are agreed for each project. Changes to an approved direction or additional deliverables may require an updated scope, price and timeline.' },
      { title: 'Project agreements', text: 'Payment milestones, cancellation arrangements, ownership, licences, final handover and ongoing support should be confirmed in your project agreement. Ask us about any point before accepting a proposal.' },
      { title: 'Work shown on this website', text: 'Portfolio materials demonstrate our work and may include client or partner-owned assets. Display on this website does not grant permission to reproduce or reuse those materials. Contact us about permissions.' },
      { title: 'IdeoFest', text: 'These studio website notes do not replace the booking, payment or event terms presented in the IdeoFest booking journey.' },
    ]} />;
}
