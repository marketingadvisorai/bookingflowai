'use client';

import { useMemo, useState } from 'react';

type GameImageCarouselProps = {
  heroImageUrl?: string | null;
  heroImageThumbUrl?: string | null;
  galleryImageUrls?: string[] | null;
  previewVideoUrl?: string | null;
  gameName: string;
};

export function GameImageCarousel({ heroImageUrl, heroImageThumbUrl, galleryImageUrls, previewVideoUrl, gameName }: GameImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(() => {
    const arr: string[] = [];
    if (heroImageUrl) arr.push(heroImageUrl);
    if (galleryImageUrls) {
      galleryImageUrls.forEach((url) => {
        if (url && !arr.includes(url)) arr.push(url);
      });
    }
    return arr;
  }, [heroImageUrl, galleryImageUrls]);

  const hasVideo = !!previewVideoUrl;
  const totalSlides = images.length + (hasVideo ? 1 : 0);

  if (totalSlides === 0) {
    return (
      <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-xs text-slate-500 dark:bg-white/[0.03] dark:text-[rgba(255,255,255,0.35)]">
        No image
      </div>
    );
  }

  if (totalSlides === 1) {
    if (hasVideo && images.length === 0) {
      return (
        <div className="relative h-40 w-full bg-slate-100 dark:bg-white/[0.03]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={heroImageThumbUrl || images[0]} alt={gameName} className="h-40 w-full bg-slate-100 object-cover dark:bg-white/[0.03]" loading="lazy" />
    );
  }

  return (
    <div className="group relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
      <div
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const container = e.currentTarget;
          setActiveIndex(Math.round(container.scrollLeft / container.offsetWidth));
        }}
      >
        {hasVideo && (
          <div className="relative h-full w-full flex-shrink-0 snap-center">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 dark:from-black dark:to-slate-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">Preview Video</div>
          </div>
        )}
        {images.map((url, i) => (
          <div key={i} className="h-full w-full flex-shrink-0 snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${gameName} - Image ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      <CarouselNavButtons />
      <DotIndicators totalSlides={totalSlides} activeIndex={activeIndex} />
    </div>
  );
}

function CarouselNavButtons() {
  const scroll = (dir: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    const container = e.currentTarget.parentElement?.querySelector('.snap-x') as HTMLDivElement | null;
    if (container) container.scrollBy({ left: (dir === 'left' ? -1 : 1) * container.offsetWidth, behavior: 'smooth' });
  };

  return (
    <>
      <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70" onClick={scroll('left')} aria-label="Previous image">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70" onClick={scroll('right')} aria-label="Next image">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </>
  );
}

function DotIndicators({ totalSlides, activeIndex }: { totalSlides: number; activeIndex: number }) {
  return (
    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
      {Array.from({ length: totalSlides }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`h-1.5 w-1.5 rounded-full transition-all ${i === activeIndex ? 'w-4 bg-white' : 'bg-white/50 hover:bg-white/75'}`}
          onClick={(e) => {
            e.preventDefault();
            const container = e.currentTarget.parentElement?.parentElement?.querySelector('.snap-x') as HTMLDivElement | null;
            if (container) container.scrollTo({ left: container.offsetWidth * i, behavior: 'smooth' });
          }}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}
