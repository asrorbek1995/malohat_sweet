'use client';

/**
 * Ekran pastida qotirilgan ikonkalik menyu:
 * "Bosh sahifa" | "Katalog" | "Savatcha"
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

const TABS = [
  { href: '/', label: 'Bosh sahifa', icon: Home },
  { href: '/catalog', label: 'Katalog', icon: LayoutGrid },
  { href: '/cart', label: 'Savatcha', icon: ShoppingBag },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { count } = useCart();

  // Admin panelda menyu ko'rinmaydi
  if (pathname?.startsWith('/admin')) return null;

  return (
    // Desktopda tepadagi menyu ishlatiladi — bu yerda yashiriladi
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white shadow-nav lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex h-[68px] max-w-lg items-stretch md:max-w-2xl">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          const isCart = tab.href === '/cart';

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-brand-600' : 'text-gray-400'
              )}
            >
              <span className="relative">
                <Icon size={23} strokeWidth={active ? 2.4 : 2} />
                {isCart && count > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-price px-1 text-[10px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </span>
              <span className={cn('text-[11px]', active ? 'font-bold' : 'font-medium')}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-brand-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
