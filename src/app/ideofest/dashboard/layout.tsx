import DashboardSidebar from '@/components/ideofest/DashboardSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organizer Dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen -mt-28">
      {/* Offset the IdeofestHeader padding */}
      <div className="pt-28 flex w-full">
        <DashboardSidebar />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
