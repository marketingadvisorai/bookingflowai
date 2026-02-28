import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/widget/', '/standalone/', '/_next/'],
      },
      {
        userAgent: 'GPTBot', // OpenAI
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/widget/', '/standalone/'],
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT browsing
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/widget/', '/standalone/'],
      },
      {
        userAgent: 'anthropic-ai', // Claude
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/widget/', '/standalone/'],
      },
      {
        userAgent: 'Claude-Web', // Claude browsing
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/widget/', '/standalone/'],
      },
    ],
    sitemap: 'https://bookingflowai.com/sitemap.xml',
  };
}
