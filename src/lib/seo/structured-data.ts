/**
 * JSON-LD Structured Data Schemas for SEO
 */

const SITE_URL = 'https://bookingflowai.com';
const ORG_NAME = 'BookingFlow';

export interface BlogPostSchema {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  content: string;
  author?: string;
  image?: string;
}

// Organization Schema (for root layout)
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    legalName: 'BookingFlow Inc.',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      'BookingFlow is the all-in-one booking platform for escape rooms and entertainment venues. AI chatbot, voice agent, email marketing, and smart scheduling.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/bookingflowai',
      'https://facebook.com/bookingflowai',
      'https://linkedin.com/company/bookingflowai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@bookingflowai.com',
      availableLanguage: ['en'],
    },
  };
}

// SoftwareApplication Schema (for product pages)
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: ORG_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    description:
      'The booking platform built for venues. AI chatbot, voice agent, email marketing, and smart scheduling. Start free.',
    screenshot: `${SITE_URL}/images/dashboard-screenshot.png`,
    featureList: [
      '24/7 AI Chatbot',
      'Voice Agent for Phone Calls',
      'Email Marketing Automation',
      'Smart Scheduling',
      'Payment Processing',
      'Analytics Dashboard',
      'Multi-venue Support',
      'Embeddable Widget',
    ],
  };
}

// BlogPosting Schema (for individual blog posts)
export function generateBlogPostingSchema(post: BlogPostSchema) {
  const readingTime = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 250));

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image || `${SITE_URL}/images/og-blog-${post.slug}.png`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author || ORG_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    articleSection: post.category,
    keywords: post.title.split(' ').slice(0, 10).join(', '),
    wordCount: post.content.trim().split(/\s+/).length,
    timeRequired: `PT${readingTime}M`,
  };
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// FAQ Schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Helper to render JSON-LD script tag
export function renderStructuredData(data: object) {
  return {
    __html: JSON.stringify(data),
  };
}
