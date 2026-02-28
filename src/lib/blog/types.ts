export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt?: string;
  category: string;
  content: string;
  publishedAt: string;
  hero: {
    gradient: string;
    emoji?: string;
    image?: string; // Path to hero image (e.g., '/blog/hero-slug.png')
  };
  keywords: string[];
}

export interface BlogConfig {
  accentColor: string;
  backgroundColor: string;
  siteUrl: string;
  siteName: string;
}

export const blogConfig: BlogConfig = {
  accentColor: '#FF4F00',
  backgroundColor: '#FFFDF9',
  siteUrl: 'https://bookingflowai.com',
  siteName: 'BookingFlow',
};
