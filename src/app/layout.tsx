import type { Metadata, Viewport } from "next";
import { Manrope } from 'next/font/google';
import "./globals.css";
import { organization } from '@/lib/seo';
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
    default: 'IdeoMint — Websites, Marketing & Creative',
    template: '%s | IdeoMint',
  },
  description: 'IdeoMint is a creative and digital agency in Jaffna, Sri Lanka. We build websites, marketing campaigns, brand identities and content that help businesses stand out and grow.',
  keywords: [
    'IdeoMint', 'Creative Agency Jaffna', 'Web Design Sri Lanka',
    'Digital Marketing', 'Brand Identity', 'Content Production'
  ],
  metadataBase: new URL('https://ideomint.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ideomint.com',
    siteName: 'Ideomint',
    title: 'IdeoMint — Websites, Marketing & Creative',
    description: 'Websites, marketing and creative experiences from IdeoMint, a creative and digital agency based in Jaffna, Sri Lanka.',
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
    title: 'IdeoMint — Websites, Marketing & Creative',
    description: 'Websites, marketing and creative experiences from IdeoMint, a creative and digital agency based in Jaffna, Sri Lanka.',
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
        <JsonLd data={organization} />
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
