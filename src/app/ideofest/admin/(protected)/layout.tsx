import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/ideofest/DashboardSidebar';
import AdminHeader from '@/components/ideofest/AdminHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ideofest Admin Portal | Management Dashboard',
  description: 'Secure event management and admin control portal for Ideofest.',
};

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdminAuthenticated();

  // If not authenticated, redirect to admin login
  if (!authenticated) {
    redirect('/ideofest/admin/login');
  }

  return (
    <div className="min-h-screen bg-section-ink text-white flex flex-col">
      <AdminHeader />
      <div className="flex-1 flex pt-20">
        <DashboardSidebar />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
