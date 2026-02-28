import type { Metadata } from 'next';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';
import { BlogListClient } from './blog-list-client';
import { getPublishedPosts } from '@/lib/blog/posts';

export const metadata: Metadata = {
  title: 'Blog | BookingFlow',
  description: 'Practical guides, strategies, and insights for escape room owners and entertainment venue operators.',
};

export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      <BlogListClient posts={posts} />
      <MarketingFooter />
    </div>
  );
}
