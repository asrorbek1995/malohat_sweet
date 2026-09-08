'use client';

/**
 * Bosh sahifa tepasidagi TO'RTBURCHAK storislar —
 * chegirmalar, mijozlar sharhlari va keyslar (Ijtimoiy Isbot).
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import type { Story } from '@/lib/types';
import { FALLBACK_IMAGE } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

export function StoryBar({ stories }: { stories: Story[] }) {
  const [active, setActive] = useState<Story | null>(null);
  const { haptic } = useTelegram();

  if (!stories.length) return null;

  return (
    <>
      <section className="py-1">
        <div className="scroll-x px-page">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => {
                haptic('light');
                setActive(story);
              }}
              className="w-[104px] shrink-0 scroll-ml-5 text-left lg:w-[150px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* To'rtburchak story kartochkasi */}
              <div className="relative h-[132px] w-full overflow-hidden rounded-2xl bg-cream ring-2 ring-brand-300 ring-offset-2 ring-offset-white lg:h-[190px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.imageUrl || FALLBACK_IMAGE}
                  alt={story.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <p className="line-clamp-2 text-[11px] font-bold leading-tight text-white">
                    {story.title}
                  </p>
                </div>
              </div>
              <p className="mt-1.5 line-clamp-1 px-0.5 text-[11px] font-medium text-muted">
                {story.subtitle}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Storyni to'liq ekranda ko'rish */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-black"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white backdrop-blur"
          >
            <X size={22} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.imageUrl || FALLBACK_IMAGE}
            alt={active.title}
            className="max-h-full w-full object-contain"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-6 pb-12">
            <h3 className="font-display text-2xl font-bold text-white">{active.title}</h3>
            <p className="mt-1 text-sm text-white/80">{active.subtitle}</p>
          </div>
        </div>
      )}
    </>
  );
}
