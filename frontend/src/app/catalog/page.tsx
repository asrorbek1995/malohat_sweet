'use client';

/**
 * 3-EKRAN: Katalog.
 *  - Gorizontal skrolldagi kategoriya teglari
 *  - Mahsulot kartochkalari (eski/yangi narx, tezkor ➕)
 *  - Kartochka bosilganda Bottom Sheet ochiladi
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/Header';
import { CategoryTabs, type FilterValue } from '@/components/features/CategoryTabs';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductSheet } from '@/components/features/ProductSheet';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Product | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { count, totalValue, hydrated } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats] = await Promise.all([api.getProducts(), api.getCategories()]);
        setProducts(prods);
        setCategories(cats);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Mahsulotlarni yuklab bo‘lmadi');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtrlash — mijoz tomonida, sahifa qayta yuklanmasdan
  const visible = useMemo(() => {
    let list = products;
    if (filter === 'best') list = list.filter((p) => p.isBestSeller);
    else if (typeof filter === 'number') list = list.filter((p) => p.categoryId === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, filter, search]);

  const openProduct = (product: Product) => {
    setSelected(product);
    setSheetOpen(true);
  };

  return (
    <main className="pb-nav min-h-dvh bg-white">
      {/* Sarlavha + qidiruv */}
      <div className="sticky top-0 z-30 bg-white lg:static">
        <div className="px-page flex items-end justify-between gap-3 border-b border-gray-100 pb-3 pt-5 lg:border-0 lg:pt-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink lg:text-4xl">Katalog</h1>
            <p className="mt-0.5 text-[13px] text-muted">
              {loading ? 'Yuklanmoqda…' : `${visible.length} ta mahsulot`}
            </p>
          </div>
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 active:bg-gray-200"
            aria-label="Qidirish"
          >
            {showSearch ? <X size={19} /> : <Search size={19} />}
          </button>
        </div>

        {showSearch && (
          <div className="px-page animate-fade-in border-b border-gray-100 py-2.5 lg:border-0">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tort, keks, pechenye…"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[15px] outline-none focus:border-brand-400 lg:max-w-md"
            />
          </div>
        )}

        {/* Kategoriya teglari */}
        {!loading && <CategoryTabs categories={categories} value={filter} onChange={setFilter} />}
      </div>

      {/* Mahsulotlar to'ri */}
      <div className="px-page pt-3">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-[13px] text-red-600">
            {error}
            <br />
            <span className="text-red-400">Backend ishlab turganini tekshiring (port 4000).</span>
          </div>
        )}

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-semibold text-ink">Mahsulot topilmadi</p>
            <p className="mt-1 text-[13px] text-muted">Boshqa kategoriyani tanlab ko‘ring</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={openProduct} />
            ))}
          </div>
        )}
      </div>

      {/* Savatga o'tish uchun suzuvchi panel */}
      {hydrated && count > 0 && (
        <div
          className="fixed inset-x-0 z-30 px-5 lg:hidden"
          style={{ bottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 10px)' }}
        >
          <Link href="/cart" className="mx-auto block max-w-lg">
            <div className="flex animate-scale-in items-center justify-between rounded-2xl bg-brand-500 px-4 py-3 text-white shadow-[0_8px_24px_rgba(239,77,120,0.4)] active:scale-[0.98]">
              <span className="flex items-center gap-2 text-[14px] font-semibold">
                <ShoppingBag size={18} />
                Savatcha · {count} ta
              </span>
              <span className="text-[15px] font-bold">{formatPrice(totalValue)}</span>
            </div>
          </Link>
        </div>
      )}

      {/* 4-EKRAN: Mahsulot haqida — pastdan chiquvchi oyna */}
      <ProductSheet product={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </main>
  );
}
