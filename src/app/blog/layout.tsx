import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Blog | BookingFlow',
  description: 'Practical guides and insights for escape room owners and venue operators. Marketing, operations, technology, and growth strategies.',
  path: '/blog',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
