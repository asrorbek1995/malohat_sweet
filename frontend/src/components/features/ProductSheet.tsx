'use client';

/**
 * 4-EKRAN: Mahsulot haqida — pastdan chiquvchi oyna (Bottom Sheet).
 *  - Katta va chiroyli rasm
 *  - Tarkib va foyda (bullet-pointlar)
 *  - Xavfni olib tashlash bloki (kafolat, 24/7 yordam)
 *  - Yopishqoq CTA: "Savatchaga qo'shish — [Narxi]"
 */
import { useState, useEffect } from 'react';
import { Check, ShieldCheck, Headphones, Truck, Minus, Plus } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/lib/types';
import { discountPercent, formatPrice, FALLBACK_IMAGE } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import { useSettings } from '@/hooks/useSettings';

interface ProductSheetProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

/** Xavfni olib tashlash bloki uchun ikonkalar (matnlar admin panelidan olinadi) */
const TRUST_ICONS = [ShieldCheck, Headphones, Truck];

export function ProductSheet({ product, open, onClose }: ProductSheetProps) {
  const { addToCart } = useCart();
  const { haptic } = useTelegram();
  const { t, rows } = useSettings();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open, product?.id]);

  if (!product) return null;

  const discount = discountPercent(product.oldPrice, product.newPrice);
  const totalPrice = product.newPrice * quantity;

  const handleAdd = () => {
    addToCart(product, quantity);
    haptic('success');
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      footer={
        // Yopishqoq CTA tugma
        <div className="flex items-center gap-3">
          <div className="flex h-12 shrink-0 items-center gap-1 rounded-2xl bg-gray-100 px-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-9 items-center justify-center rounded-xl text-gray-600 active:bg-gray-200"
              aria-label="Kamaytirish"
            >
              <Minus size={17} />
            </button>
            <span className="w-6 text-center text-[15px] font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-9 items-center justify-center rounded-xl text-gray-600 active:bg-gray-200"
              aria-label="Ko'paytirish"
            >
              <Plus size={17} />
            </button>
          </div>

          <Button size="lg" fullWidth onClick={handleAdd} className="flex-1 text-[15px]">
            {t('add_to_cart_button')} — {formatPrice(totalPrice)}
          </Button>
        </div>
      }
    >
      {/* Katta va chiroyli rasm */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream lg:aspect-[16/7] lg:rounded-t-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.title}
          className="h-full w-full object-cover"
        />
        {discount && (
          <span className="absolute left-4 top-4 rounded-xl bg-price px-3 py-1 text-sm font-bold text-white shadow-lg">
            -{discount}% chegirma
          </span>
        )}
      </div>

      <div className="px-5 pb-6 pt-4 lg:px-8">
        {/* Kategoriya */}
        {product.categoryName && (
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-600">
            {product.categoryName}
          </span>
        )}

        <h2 className="mt-2 font-display text-[26px] font-bold leading-tight text-ink lg:text-[34px]">
          {product.title}
        </h2>

        {/* Narxlar */}
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="price-new text-[28px] leading-none">{formatPrice(product.newPrice)}</span>
          {product.oldPrice ? <span className="price-old text-base">{formatPrice(product.oldPrice)}</span> : null}
        </div>

        {product.description && (
          <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{product.description}</p>
        )}

        {/* Tarkib va foyda — bullet-pointlar */}
        {product.ingredients?.length > 0 && (
          <div className="mt-5 rounded-2xl border border-gray-100 bg-cream p-4">
            <h4 className="mb-2.5 text-[15px] font-bold text-ink">{t('ingredients_title')}</h4>
            <ul className="space-y-2">
              {product.ingredients.map((line, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] leading-snug text-gray-700">
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Xavfni olib tashlash bloki */}
        <div className="mt-4 space-y-2.5 md:grid md:grid-cols-3 md:gap-2.5 md:space-y-0">
          {rows('trust_badges').map(([title, text], i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
            return (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 md:flex-col md:items-start md:gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-ink">{title}</p>
                  {text && <p className="text-[12px] text-muted">{text}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
