import type { Metadata } from 'next';
import IdeofestThemeSetter from '@/components/ideofest/IdeofestThemeSetter';

export const metadata: Metadata = {
  title: {
    default: 'Ideofest | Live Events & Experiences',
    template: '%s | Ideofest',
  },
  description: "Discover, book, and experience Ideomint's curated live events — music, tech, art, wellness, and more.",
};

export default function IdeofestRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-section-ink text-white ideofest-theme">
      <IdeofestThemeSetter />
      {children}
    </div>
  );
}
