import { Metadata } from 'next';

const SITE_URL = 'https://bookingflowai.com';
const SITE_NAME = 'BookingFlow';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`;

export interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
}

export function generateMetadata({
  title,
  description,
  path = '',
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  type = 'website',
  publishedTime,
  author,
}: SEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === '' ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'booking system',
      'escape room software',
      'venue booking',
      'online booking',
      'AI chatbot',
      'voice agent',
      'email marketing',
      'booking automation',
    ],
    authors: author ? [{ name: author }] : undefined,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      ...(publishedTime && { publishedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@bookingflowai',
      site: '@bookingflowai',
    },
  };
}
