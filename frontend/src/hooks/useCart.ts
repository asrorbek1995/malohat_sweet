'use client';

/**
 * Savat bilan ishlash hooki.
 * Zustand persist SSR bilan mos bo'lishi uchun "hydrated" bayrog'i qo'shilgan.
 */
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useTelegram } from './useTelegram';
import type { Product } from '@/lib/types';

export function useCart() {
  const store = useCartStore();
  const { haptic } = useTelegram();
  const [hydrated, setHydrated] = useState(false);

  // localStorage faqat brauzerda mavjud — birinchi renderdan keyin yoqamiz
  useEffect(() => setHydrated(true), []);

  /** Mahsulotni savatga qo'shish + tebranish (haptic) */
  const addToCart = (product: Product, quantity = 1) => {
    store.add(product, quantity);
    haptic('light');
  };

  const removeFromCart = (productId: number) => {
    store.remove(productId);
    haptic('medium');
  };

  return {
    ...store,
    hydrated,
    addToCart,
    removeFromCart,
    // Hydration tugamaguncha 0 ko'rsatamiz (server/client mos kelishi uchun)
    count: hydrated ? store.totalItems() : 0,
    subtotalValue: hydrated ? store.subtotal() : 0,
    totalValue: hydrated ? store.total() : 0,
    bumpValue: hydrated ? store.bumpPrice() : 0,
  };
}
