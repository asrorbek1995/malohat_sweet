'use client';

/**
 * Desktop (lg va undan katta) uchun tepadagi menyu.
 * Telefon va planshetda ko'rinmaydi — u yerda pastki menyu ishlaydi.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';

const LINKS = [
  { href: '/', label: 'Bosh sahifa', icon: Home },
  { href: '/catalog', label: 'Katalog', icon: LayoutGrid },
];

export function TopNavigation() {
  const pathname = usePathname();
  const { count, totalValue } = useCart();
  const { t } = useSettings();

  if (pathname?.startsWith('/admin')) return null;

  const first = t('shop_name').trim().split(/\s+/)[0];

  return (
    <header className="sticky top-0 z-40 hidden border-b border-gray-100 bg-white/90 backdrop-blur lg:block">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-8 px-8">
        {/* Logotip */}
        <Link href="/" className="shrink-0">
          <span className="brand-script text-[34px]">{first}</span>
        </Link>

        {/* Bo'limlar */}
        <nav className="flex flex-1 items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-[15px] font-semibold transition-colors',
                  active ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-ink'
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Savatcha */}
        <Link
          href="/cart"
          className={cn(
            'flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-[14.5px] font-semibold transition-colors',
            count > 0
              ? 'bg-brand-500 text-white hover:bg-brand-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <span className="relative">
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-600">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </span>
          {count > 0 ? formatPrice(totalValue) : 'Savatcha'}
        </Link>
      </div>
    </header>
  );
}
