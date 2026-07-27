import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Ideofest | Live Events & Experiences',
    template: '%s | Ideofest',
  },
  description: "Discover, book, and experience Ideomint's curated live events — music, tech, art, wellness, and more.",
};

export default function PublicIdeofestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
