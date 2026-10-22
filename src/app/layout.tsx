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
    default: 'IdeoMint | Websites, Marketing & Creative',
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
    siteName: 'IdeoMint',
    title: 'IdeoMint | Websites, Marketing & Creative',
    description: 'Websites, marketing and creative experiences from IdeoMint, a creative and digital agency based in Jaffna, Sri Lanka.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IdeoMint creative and digital agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeoMint | Websites, Marketing & Creative',
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
    icon: [{ url: '/ideomint-icon.png', type: 'image/png', sizes: '96x96' }, { url: '/favicon.ico', sizes: '96x96' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
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
