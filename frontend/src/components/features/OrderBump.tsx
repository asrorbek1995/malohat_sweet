'use client';

/**
 * Order Bump — savatchadagi qo'shimcha savdo.
 * "Bunga qo'shimcha ravishda [Bonus shirinlik]ni atigi [narx] ga qo'shasizmi?"
 */
import { Gift } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import type { Product } from '@/lib/types';
import { formatPrice, FALLBACK_IMAGE, cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import { useSettings } from '@/hooks/useSettings';

export function OrderBump({ product }: { product: Product | null }) {
  const { bumpEnabled, toggleBump } = useCart();
  const { haptic } = useTelegram();
  const { t } = useSettings();

  if (!product) return null;

  const handleToggle = (value: boolean) => {
    toggleBump(value);
    haptic(value ? 'success' : 'light');
  };

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-dashed p-3.5 transition-colors',
        bumpEnabled ? 'border-brand-400 bg-brand-50' : 'border-amber-300 bg-amber-50/60'
      )}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <Gift size={17} className="text-amber-500" />
        <span className="text-[12px] font-bold uppercase tracking-wide text-amber-600">
          {t('bump_badge')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-[58px] w-[58px] shrink-0 overflow-hidden rounded-xl bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl || FALLBACK_IMAGE}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold leading-snug text-ink">
            {t('bump_prefix')} <span className="text-brand-600">{product.title}</span>ni atigi{' '}
            <span className="price-new">{formatPrice(product.newPrice)}</span> {t('bump_suffix')}
          </p>
          {product.oldPrice ? (
            <p className="mt-0.5 text-[11px] text-muted">
              Odatdagi narxi <span className="line-through">{formatPrice(product.oldPrice)}</span> —
              siz {formatPrice(product.oldPrice - product.newPrice)} tejaysiz
            </p>
          ) : null}
        </div>

        <Switch checked={bumpEnabled} onChange={handleToggle} label="Bonusni qo'shish" />
      </div>
    </div>
  );
}
