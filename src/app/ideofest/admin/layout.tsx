import { privateMetadata } from '@/lib/seo';
export const metadata = privateMetadata;
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
