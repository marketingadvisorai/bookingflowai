'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/lib/blog/types';
import { estimateReadingTime } from '@/lib/blog/posts';

const categories = ['All', 'Marketing', 'Product', 'Guides'];

export function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Hero */}
      <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 lg:pb-16 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">
              Blog
            </span>
          </div>
          <h1 className="font-display text-[28px] sm:text-[40px] lg:text-[64px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
            Insights for venue owners
          </h1>
          <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#574E4C] max-w-xl">
            Practical guides, marketing strategies, and product tips to help you fill more time slots and grow your business.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section className="px-4 sm:px-6 lg:px-10 pb-12">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={
                'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ' +
                (active === cat
                  ? 'bg-[#FF4F00] text-white'
                  : 'bg-[#F8F5F0] text-[#574E4C] hover:bg-[#F0EDE8] hover:text-[#201515]')
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl bg-white border border-[#E7E5E4]/60 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300"
              >
                {/* Hero image or gradient fallback */}
                {post.hero.image ? (
                  <img 
                    src={post.hero.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className={`h-48 bg-gradient-to-br ${post.hero.gradient} flex items-center justify-center`}>
                    {post.hero.emoji && (
                      <span className="text-6xl opacity-80">{post.hero.emoji}</span>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF4F00] bg-[#FF4F00]/8 px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-[#93908C]">
                      {estimateReadingTime(post.content)} min read
                    </span>
                  </div>

                  <h2 className="font-display text-lg font-semibold text-[#201515] leading-snug mb-2 group-hover:text-[#FF4F00] transition-colors duration-200">
                    {post.title}
                  </h2>

                  <p className="text-sm text-[#6F6765] leading-relaxed line-clamp-2 mb-4">
                    {post.description}
                  </p>

                  <time className="text-xs font-medium text-[#93908C]">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-[#93908C] py-20 text-lg">
              No posts in this category yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </>
  );
}
