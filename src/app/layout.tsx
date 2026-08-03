import type { Metadata, Viewport } from "next";
import { Manrope } from 'next/font/google';
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";
import SplashScreen from "@/components/ui/SplashScreen";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";

// Self-host Manrope via next/font/google
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#05070D',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Ideomint | Ideofest 2026 – Innovation Events, Branding & Digital Experiences',
    template: '%s | Ideomint – Home of Ideofest',
  },
  description: 'Ideomint is the official home of Ideofest 2026, offering live innovation events, event ticketing, brand strategy, web development, and creative digital experiences.',
  keywords: [
    'Ideomint', 'Ideofest', 'Ideofest 2026', 'Ideomint Sri Lanka', 'Ideofest Events',
    'Sing Along Jaffna', 'Event Tickets Sri Lanka', 'Brand Strategy', 'Web Design Sri Lanka',
    'Creative Experience Company'
  ],
  metadataBase: new URL('https://ideomint.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ideomint.com',
    siteName: 'Ideomint',
    title: 'Ideomint | Ideofest 2026 – Innovation Events, Branding & Digital Experiences',
    description: 'Ideomint is the home of Ideofest 2026, offering live innovation events, ticketing, branding, and digital experiences.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ideomint & Ideofest 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ideomint | Ideofest 2026 – Innovation Events, Branding & Digital Experiences',
    description: 'Ideomint is the home of Ideofest 2026, offering live innovation events, ticketing, branding, and digital experiences.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/ideomint-dp.svg',
    shortcut: '/ideomint-dp.svg',
    apple: '/ideomint-dp.svg',
  },
  alternates: {
    canonical: 'https://ideomint.com',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable}`} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com https://cdn.fontshare.com; font-src 'self' data: https://fonts.gstatic.com https://api.fontshare.com https://cdn.fontshare.com" />
        <link rel="icon" type="image/svg+xml" href="/ideomint-dp.svg" />
        <link rel="apple-touch-icon" href="/ideomint-dp.svg" />
      </head>
      <body className="bg-section-ink">
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Ideomint',
          description: 'Different Sections. One Creative Vision.',
          url: 'https://ideomint.com',
          logo: 'https://ideomint.com/logo.png',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@ideomint.com',
            contactType: 'customer service',
          },
        }} />
        <SmoothScroll>
          <SplashScreen>
            <CustomCursor />
            <div className="noise-overlay" />
            {children}
          </SplashScreen>
        </SmoothScroll>
      </body>
    </html>
  );
}
