import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';
import { getPostBySlug, getRelatedPosts, getPublishedPosts, estimateReadingTime } from '@/lib/blog/posts';
import { BlogMarkdown } from '@/lib/blog/BlogMarkdown';
import { CopyLinkButton } from './copy-link-button';
import { generateMetadata as genMeta } from '@/lib/seo/metadata';
import { generateBlogPostingSchema, generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo/structured-data';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  
  return genMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    author: 'BookingFlow Team',
  });
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 3);
  const readTime = estimateReadingTime(post.content);

  // Structured data schemas
  const blogPostingSchema = generateBlogPostingSchema({
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    category: post.category,
    content: post.content,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://bookingflowai.com' },
    { name: 'Blog', url: 'https://bookingflowai.com/blog' },
    { name: post.title, url: `https://bookingflowai.com/blog/${post.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderStructuredData(blogPostingSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderStructuredData(breadcrumbSchema)}
      />

      <MarketingNav />

      {/* Breadcrumb */}
      <div className="border-b border-[#E7E5E4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-4">
          <nav className="flex items-center gap-2 text-sm text-[#93908C]" aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-[#201515] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-[#574E4C] truncate max-w-md">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8">
        <div className="grid lg:grid-cols-[1fr_260px] gap-8 sm:gap-10 lg:gap-16">
          <div>
            {/* Hero image or gradient fallback */}
            {post.hero.image ? (
              <div className="w-full max-w-3xl mb-10">
                <img 
                  src={post.hero.image} 
                  alt={post.title}
                  className="w-full h-auto rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
            ) : (
              <div className={`w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br ${post.hero.gradient} flex items-center justify-center mb-10`}>
                {post.hero.emoji && (
                  <span className="text-8xl opacity-80">{post.hero.emoji}</span>
                )}
              </div>
            )}

            <h1 className="font-display text-[32px] sm:text-[40px] lg:text-[48px] font-medium leading-[1.1] tracking-[-0.02em] text-[#201515] mb-6">
              {post.title}
            </h1>
            <p className="text-lg lg:text-xl text-[#574E4C] leading-[1.7] max-w-2xl">
              {post.description}
            </p>
          </div>

          <aside className="lg:pt-48">
            <div className="space-y-6 text-sm">
              <div>
                <p className="text-[#93908C] text-xs uppercase tracking-wider font-bold mb-1">Category</p>
                <p className="text-[#201515] font-semibold">{post.category}</p>
              </div>
              <div>
                <p className="text-[#93908C] text-xs uppercase tracking-wider font-bold mb-1">Date</p>
                <time className="text-[#201515] font-semibold">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
              <div>
                <p className="text-[#93908C] text-xs uppercase tracking-wider font-bold mb-1">Reading time</p>
                <p className="text-[#201515] font-semibold">{readTime} min</p>
              </div>
              <div>
                <p className="text-[#93908C] text-xs uppercase tracking-wider font-bold mb-1">Share</p>
                <CopyLinkButton />
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10 pb-16">
        <BlogMarkdown content={post.content} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-[#E7E5E4]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
            <h2 className="font-display text-2xl font-semibold text-[#201515] mb-10">Related articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                  {p.hero.image ? (
                    <img 
                      src={p.hero.image} 
                      alt={p.title}
                      className="w-full h-40 object-cover rounded-2xl mb-4 group-hover:shadow-lg transition-shadow duration-200"
                    />
                  ) : (
                    <div className={`h-40 rounded-2xl bg-gradient-to-br ${p.hero.gradient} flex items-center justify-center mb-4`}>
                      {p.hero.emoji && <span className="text-5xl opacity-80">{p.hero.emoji}</span>}
                    </div>
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF4F00] mb-2 block">{p.category}</span>
                  <h3 className="font-display text-lg font-semibold text-[#201515] leading-snug group-hover:text-[#FF4F00] transition-colors">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <MarketingFooter />
    </div>
  );
}
