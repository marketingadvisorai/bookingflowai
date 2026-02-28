import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'About — BookingFlow',
  description: 'BookingFlow is the booking platform built specifically for escape rooms and entertainment venues. Built by venue owners who understand the business.',
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
