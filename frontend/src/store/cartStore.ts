'use client';

/**
 * Savat holati — Zustand + localStorage (persist).
 * Order Bump alohida saqlanadi (switch orqali yoqiladi/o'chiriladi).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /** Savatchadagi qo'shimcha savdo yoqilganmi */
  bumpEnabled: boolean;
  bumpProduct: Product | null;

  add: (product: Product, quantity?: number) => void;
  remove: (productId: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;

  setBumpProduct: (product: Product | null) => void;
  toggleBump: (value?: boolean) => void;
  /** Savatdagi mahsulotlarni bazadagi joriy holat bilan yangilash */
  syncWith: (fresh: Product[]) => void;

  // ---- Hisob-kitob ----
  getQuantity: (productId: number) => number;
  totalItems: () => number;
  subtotal: () => number;
  bumpPrice: () => number;
  total: () => number;
  /** Backendga yuboriladigan ko'rinish */
  toPayload: () => { productId: number; quantity: number }[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      bumpEnabled: false,
      bumpProduct: null,

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        }),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),

      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })),

      decrement: (productId) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [], bumpEnabled: false }),

      setBumpProduct: (product) => set({ bumpProduct: product }),

      toggleBump: (value) =>
        set((state) => ({ bumpEnabled: value === undefined ? !state.bumpEnabled : value })),

      /**
       * Savat localStorage'da saqlanadi, shuning uchun narx yoki nom eskirgan bo'lishi mumkin.
       * Bu funksiya ularni bazadagi joriy ma'lumot bilan almashtiradi;
       * o'chirilgan yoki nofaol mahsulotlar savatdan chiqariladi.
       */
      syncWith: (fresh) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            const actual = fresh.find((p) => p.id === item.product.id);
            if (!actual || !actual.isActive) return [];
            return [{ ...item, product: actual }];
          }),
        })),

      // ---- Hisob-kitob ----
      getQuantity: (productId) => get().items.find((i) => i.product.id === productId)?.quantity ?? 0,

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.product.newPrice * i.quantity, 0),

      bumpPrice: () => {
        const { bumpEnabled, bumpProduct } = get();
        return bumpEnabled && bumpProduct ? bumpProduct.newPrice : 0;
      },

      total: () => get().subtotal() + get().bumpPrice(),

      toPayload: () => {
        const { items, bumpEnabled, bumpProduct } = get();
        const payload = items.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
        if (bumpEnabled && bumpProduct) payload.push({ productId: bumpProduct.id, quantity: 1 });
        return payload;
      },
    }),
    {
      name: 'malohat-cart',
      storage: createJSONStorage(() => localStorage),
      // bumpProduct har safar backenddan yangilanadi — saqlamaymiz
      partialize: (state) => ({ items: state.items, bumpEnabled: state.bumpEnabled }) as CartState,
    }
  )
);
