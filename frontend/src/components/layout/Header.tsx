'use client';

/**
 * Bosh sahifa sarlavhasi — do'kon nomining chiroyli "logotip" ko'rinishi.
 * Birinchi so'z nafis qo'lyozma shriftda, qolgani ajratilgan harflar bilan.
 * Matnlar admin panelidagi "Matnlar" bo'limidan olinadi.
 */
import { useTelegram } from '@/hooks/useTelegram';
import { useSettings } from '@/hooks/useSettings';

/** "Malohat pishiriqlari" -> { first: 'Malohat', rest: 'pishiriqlari' } */
function splitBrand(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return { first: name.trim(), rest: '' };
  return { first: parts[0], rest: parts.slice(1).join(' ') };
}

export function Header() {
  const { firstName } = useTelegram();
  const { t } = useSettings();

  const { first, rest } = splitBrand(t('shop_name'));

  return (
    <header className="px-page bg-white pb-5 pt-7 text-center lg:pb-8 lg:pt-12">
      {/* Yuqoridagi kichik yorliq */}
      <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-500">
        <span className="h-px w-6 bg-brand-200" />
        Uyda pishirilgan
        <span className="h-px w-6 bg-brand-200" />
      </p>

      {/* Do'kon nomi — chiroyli logotip */}
      <h1 className="mt-2">
        <span className="brand-script block text-[46px] sm:text-[54px] lg:text-[68px]">
          {first}
        </span>
        {rest && (
          <span className="brand-sub mt-0.5 block text-[11px] font-bold sm:text-[12.5px] lg:text-[15px]">
            {rest}
          </span>
        )}
      </h1>

      {/* Bezakli ajratgich */}
      <div className="mt-3.5 flex items-center justify-center gap-2.5" aria-hidden="true">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-brand-200 lg:w-16" />
        <span className="text-[13px] text-brand-400">✿</span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-brand-200 lg:w-16" />
      </div>

      <p className="mx-auto mt-3 max-w-xs text-[13px] leading-snug text-muted lg:max-w-md lg:text-[15px]">
        {t('welcome_text')}
      </p>

      {/* Shaxsiy xush kelibsiz matni */}
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-[13.5px] font-semibold text-ink lg:text-[15px]">
        {t('welcome_greeting')},{' '}
        <span className="text-brand-600">{firstName}</span> 👋
      </p>
    </header>
  );
}

/** Ichki sahifalar uchun oddiy sarlavha */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-page sticky top-0 z-20 border-b border-gray-100 bg-white pb-3 pt-5 lg:static lg:border-0 lg:pb-4 lg:pt-8">
      <h1 className="font-display text-2xl font-bold text-ink lg:text-4xl">{title}</h1>
      {subtitle && <p className="mt-0.5 text-[13px] text-muted lg:text-[15px]">{subtitle}</p>}
    </div>
  );
}
