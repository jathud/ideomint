import type { Metadata } from 'next';
import StudioPage from '@/components/ui/StudioPage';

export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return <StudioPage title="Privacy policy" intro="This page explains how the IdeoMint studio website handles information you provide when discussing a project. For questions about your information, contact hello@ideomint.com."
    sections={[
      { title: 'Information you choose to share', text: 'Our enquiry forms request your name, email, service interests and project details. The custom-plan form also asks for a phone number and offers optional business, budget, timeline and website fields. Please avoid including passwords, payment details or sensitive personal information.' },
      { title: 'How enquiries are used', text: 'We use enquiry information to respond, understand the proposed work and continue the conversation with you. Form messages are sent to our studio mailbox through Zoho Mail. Submitting an enquiry does not subscribe you to a newsletter.' },
      { title: 'Website and email providers', text: 'Website hosting and email providers process technical information needed to operate their services. Zoho processes messages delivered through our email connection. The website also uses a portfolio administration service; its sign-in is separate from public project enquiries.' },
      { title: 'External services', text: 'WhatsApp and social links take you to other services. Their privacy policies apply when you use them. IdeoFest bookings and payment services are separate flows; check the information presented there before providing booking or payment details.' },
      { title: 'Questions, corrections and deletion requests', text: 'Email hello@ideomint.com to ask about an enquiry, correct information or request deletion. Include enough detail for us to identify the conversation. We will consider your request alongside any records needed for an active project or other applicable obligations.' },
    ]} />;
}
