import { redirect } from 'next/navigation';

export default function LegacyDashboardEventsRedirect() {
  redirect('/ideofest/admin/events');
}
