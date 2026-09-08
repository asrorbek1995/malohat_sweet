'use client';

/**
 * Mahsulot kartochkasi:
 *  - Rasm
 *  - Nom
 *  - Ustiga chizilgan ESKI narx
 *  - QIZIL rangdagi YANGI narx
 *  - Tezkor qo'shish tugmasi (➕) — sahifadan chiqmasdan savatga qo'shish
 */
import { Plus, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { discountPercent, formatPrice, FALLBACK_IMAGE, cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
  /** Kartochka bosilganda Bottom Sheet ochiladi */
  onOpen: (product: Product) => void;
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { addToCart, getQuantity, hydrated } = useCart();
  const qty = hydrated ? getQuantity(product.id) : 0;
  const discount = discountPercent(product.oldPrice, product.newPrice);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
      {/* Rasm — bosilganda mahsulot oynasi ochiladi */}
      <button onClick={() => onOpen(product)} className="relative block aspect-square w-full overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-active:scale-105"
        />

        {/* Chegirma belgisi */}
        {discount && (
          <span className="absolute left-2 top-2 rounded-lg bg-price px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Xit belgisi */}
        {product.isBestSeller && (
          <span className="absolute right-2 top-2 rounded-lg bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-white">
            🔥 XIT
          </span>
        )}
      </button>

      {/* Matn qismi */}
      <div className="flex flex-1 flex-col p-2.5 pt-2">
        <button onClick={() => onOpen(product)} className="text-left">
          <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-tight text-ink">
            {product.title}
          </h3>
        </button>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            {product.oldPrice ? (
              <div className="price-old truncate text-[11px]">{formatPrice(product.oldPrice)}</div>
            ) : null}
            {/* Yangi narx — QIZIL */}
            <div className="price-new truncate text-[15px] leading-tight">
              {formatPrice(product.newPrice)}
            </div>
          </div>

          {/* Tezkor qo'shish tugmasi */}
          <button
            aria-label="Savatchaga qo'shish"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-90',
              qty > 0 ? 'bg-green-500 text-white' : 'bg-brand-500 text-white'
            )}
          >
            {qty > 0 ? (
              <span className="flex items-center gap-0.5 text-[13px] font-bold">
                <Check size={13} strokeWidth={3} />
                {qty}
              </span>
            ) : (
              <Plus size={19} strokeWidth={2.8} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
