import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Pricing — BookingFlow',
  description: 'Simple, transparent pricing. Start free with 150 bookings/month. Pro plan $49/month. Business plan $99/month. Service fees (1.2-1.9%) charged to customers.',
  path: '/pricing',
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
