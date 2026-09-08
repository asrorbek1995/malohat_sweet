'use client';

/**
 * 2-EKRAN: Asosiy sahifa.
 * To'g'ridan-to'g'ri sotuv yo'q — ishonch va foyda berishga qaratilgan.
 *
 * Sahifadagi BARCHA reklama matnlari admin panelidagi "Matnlar" bo'limidan olinadi.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StoryBar } from '@/components/features/StoryBar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import type { Story } from '@/lib/types';
import { FALLBACK_IMAGE } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';

export default function HomePage() {
  const { t, rows } = useSettings();

  const [stories, setStories] = useState<Story[]>([]);
  const [banner, setBanner] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const allStories = await api.getStories();
        setStories(allStories.filter((s) => s.type === 'STORY'));
        setBanner(allStories.find((s) => s.type === 'BANNER') ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ma’lumotlarni yuklab bo‘lmadi');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="pb-nav min-h-dvh bg-white">
      <Header />

      {/* ---------- Story bloki (ijtimoiy isbot) ---------- */}
      {loading ? (
        <div className="scroll-x px-page py-1">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[132px] w-[104px] shrink-0" />
          ))}
        </div>
      ) : (
        <StoryBar stories={stories} />
      )}

      {error && (
        <div className="mx-page mt-3 rounded-2xl bg-red-50 p-3 text-[13px] text-red-600">
          {error}
          <br />
          <span className="text-red-400">Backend ishlab turganini tekshiring (port 4000).</span>
        </div>
      )}

      {/* ---------- Asosiy reklama vidjeti (Hero) ---------- */}
      <section className="px-page pt-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white lg:p-12">
          {banner?.imageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageUrl || FALLBACK_IMAGE}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/85 to-brand-800/85" />
            </>
          )}

          <div className="relative lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* Matn qismi */}
            <div>
              {t('hero_badge') && (
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur">
                  {t('hero_badge')}
                </span>
              )}

              <h2 className="mt-3 whitespace-pre-line font-display text-[27px] font-bold leading-tight lg:text-[46px]">
                {t('hero_title')}
              </h2>

              <p className="mt-2 max-w-[90%] text-[13.5px] leading-snug text-white/85 lg:text-[17px]">
                {t('hero_text')}
              </p>
            </div>

            {/* Tugmalar */}
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:mt-0 lg:flex-col">
              <Link href="/catalog" className="sm:flex-1">
                <Button
                  size="lg"
                  fullWidth
                  className="bg-white text-brand-600 shadow-lg active:bg-brand-50"
                  icon={<ShoppingBag size={19} />}
                >
                  {t('hero_button')}
                </Button>
              </Link>

              <Link href="/catalog" className="sm:flex-1">
                <Button
                  size="md"
                  variant="ghost"
                  fullWidth
                  className="border border-white/40 text-white active:bg-white/10"
                >
                  {t('hero_button_secondary')} <ArrowRight size={17} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Ishonch ko'rsatkichlari ---------- */}
      {rows('stats').length > 0 && (
        <section className="px-page pt-5 lg:pt-8">
          <div className="grid grid-cols-4 gap-2 lg:gap-4">
            {rows('stats').map(([value, label], i) => (
              <div key={i} className="rounded-2xl bg-cream px-1.5 py-3 text-center lg:py-6">
                <p className="text-[15px] font-bold leading-none text-brand-600 lg:text-[28px]">{value}</p>
                <p className="mt-1.5 text-[10px] leading-tight text-muted lg:mt-2 lg:text-[13px]">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Afzalliklar ---------- */}
      {rows('benefits').length > 0 && (
        <section className="px-page pt-6 lg:pt-12">
          <h3 className="font-display text-xl font-bold text-ink lg:text-3xl">{t('benefits_title')}</h3>
          <div className="mt-3 space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:mt-6">
            {rows('benefits').map(([emoji, title, text], i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3.5 lg:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-xl">
                  {emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-bold text-ink">{title}</p>
                  {text && <p className="text-[12.5px] text-muted">{text}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Mijozlar sharhlari ---------- */}
      {rows('reviews').length > 0 && (
        <section className="px-page pt-6 lg:pt-12">
          <h3 className="font-display text-xl font-bold text-ink lg:text-3xl">{t('reviews_title')}</h3>
          <div className="scroll-x -mx-5 mt-3 px-5 md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:px-0 lg:mt-6 lg:grid-cols-3 lg:gap-5">
            {rows('reviews').map(([name, text], i) => (
              <div key={i} className="w-[248px] shrink-0 rounded-2xl border border-gray-100 p-4 md:w-auto lg:p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-2 text-[13px] leading-snug text-gray-600 lg:text-[15px]">“{text}”</p>
                <p className="mt-2.5 text-[12.5px] font-bold text-ink">{name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Pastki chaqiriq ---------- */}
      <section className="px-page pb-2 pt-7 lg:pb-16 lg:pt-14">
        <div className="rounded-3xl bg-cream p-5 text-center lg:p-12">
          <p className="font-display text-lg font-bold text-ink lg:text-3xl">{t('cta_title')}</p>
          <p className="mt-1 text-[13px] text-muted lg:text-[16px]">{t('cta_text')}</p>
          <Link href="/catalog" className="mx-auto mt-4 block lg:mt-7 lg:max-w-xs">
            <Button size="lg" fullWidth icon={<ShoppingBag size={19} />}>
              {t('cta_button')}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
