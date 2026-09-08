'use client';

/**
 * Savatchadagi mahsulotlar ro'yxati va soni.
 */
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice, FALLBACK_IMAGE } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

export function CartList() {
  const { items, increment, decrement, removeFromCart } = useCart();

  return (
    <ul className="space-y-3">
      {items.map(({ product, quantity }) => (
        <li key={product.id} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-2.5">
          {/* Rasm */}
          <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl || FALLBACK_IMAGE}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Ma'lumot */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-[14px] font-semibold leading-tight text-ink">
                {product.title}
              </h3>
              <button
                onClick={() => removeFromCart(product.id)}
                aria-label="O'chirish"
                className="shrink-0 rounded-lg p-1 text-gray-300 active:bg-red-50 active:text-red-500"
              >
                <Trash2 size={17} />
              </button>
            </div>

            <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
              <div>
                {product.oldPrice ? (
                  <div className="price-old text-[11px]">{formatPrice(product.oldPrice * quantity)}</div>
                ) : null}
                <div className="price-new text-[15px] leading-tight">
                  {formatPrice(product.newPrice * quantity)}
                </div>
              </div>

              {/* Soni */}
              <div className="flex h-8 items-center gap-0.5 rounded-xl bg-gray-100 px-0.5">
                <button
                  onClick={() => decrement(product.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 active:bg-gray-200"
                  aria-label="Kamaytirish"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-[14px] font-bold">{quantity}</span>
                <button
                  onClick={() => increment(product.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 active:bg-gray-200"
                  aria-label="Ko'paytirish"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
