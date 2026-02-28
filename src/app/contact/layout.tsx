import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Contact | BookingFlow',
  description: 'Get in touch with the BookingFlow team. Questions about pricing, features, or custom integrations? We are here to help.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
