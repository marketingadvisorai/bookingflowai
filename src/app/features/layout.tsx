import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Features — BookingFlow',
  description: 'Everything your venue needs to grow. AI chatbot, voice agent, email marketing, smart scheduling, payment processing, and analytics. All in one platform.',
  path: '/features',
});

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
