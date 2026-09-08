'use client';

/**
 * Admin: mahsulotlarni boshqarish —
 * narxlarni tahrirlash, matnlarni o'zgartirish, URL orqali rasm qo'shish.
 */
import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, EyeOff, Gift, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ImagePicker } from './ImagePicker';
import { adminApi } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import { formatPrice, FALLBACK_IMAGE, cn } from '@/lib/utils';

type Draft = Partial<Product> & { ingredientsText?: string };

const EMPTY: Draft = {
  title: '',
  description: '',
  ingredientsText: '',
  oldPrice: null,
  newPrice: 0,
  imageUrl: '',
  categoryId: null,
  isOrderBump: false,
  isBestSeller: false,
  isActive: true,
  sortOrder: 0,
};

export function ProductsTab({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Draft | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([adminApi.getProducts(token), adminApi.getCategories(token)]);
      setProducts(p);
      setCategories(c);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openNew = () => {
    setEditing({ ...EMPTY });
    setSheetOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p, ingredientsText: (p.ingredients || []).join('\n') });
    setSheetOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) return alert('Mahsulot nomini kiriting');
    if (!editing.newPrice) return alert('Yangi narxni kiriting');

    setSaving(true);
    try {
      const body: Partial<Product> = {
        title: editing.title,
        description: editing.description || '',
        ingredients: (editing.ingredientsText || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        oldPrice: editing.oldPrice ? Number(editing.oldPrice) : null,
        newPrice: Number(editing.newPrice),
        imageUrl: editing.imageUrl || '',
        categoryId: editing.categoryId ? Number(editing.categoryId) : null,
        isOrderBump: !!editing.isOrderBump,
        isBestSeller: !!editing.isBestSeller,
        isActive: editing.isActive !== false,
        sortOrder: Number(editing.sortOrder || 0),
      };

      if (editing.id) await adminApi.updateProduct(token, editing.id, body);
      else await adminApi.createProduct(token, body);

      setSheetOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`"${p.title}" o'chirilsinmi?`)) return;
    try {
      await adminApi.deleteProduct(token, p.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'O‘chirishda xatolik');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">{products.length} ta mahsulot</p>
        <Button size="sm" onClick={openNew} icon={<Plus size={16} />}>
          Yangi qo‘shish
        </Button>
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-3 text-[13px] text-red-600">{error}</div>}
      {loading && <p className="py-8 text-center text-[13px] text-muted">Yuklanmoqda…</p>}

      <ul className="space-y-2">
        {products.map((p) => (
          <li
            key={p.id}
            className={cn(
              'flex gap-3 rounded-2xl border border-gray-100 p-2.5',
              !p.isActive && 'opacity-50'
            )}
          >
            <div className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrl || FALLBACK_IMAGE}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-1.5">
                <h4 className="line-clamp-1 flex-1 text-[13.5px] font-semibold text-ink">{p.title}</h4>
                {p.isOrderBump && <Gift size={14} className="shrink-0 text-amber-500" />}
                {p.isBestSeller && <Flame size={14} className="shrink-0 text-orange-500" />}
                {!p.isActive && <EyeOff size={14} className="shrink-0 text-gray-400" />}
              </div>

              <p className="mt-0.5 text-[11.5px] text-muted">{p.categoryName || 'Kategoriyasiz'}</p>

              <div className="mt-1 flex items-center gap-2">
                {p.oldPrice ? <span className="price-old text-[11px]">{formatPrice(p.oldPrice)}</span> : null}
                <span className="price-new text-[13.5px]">{formatPrice(p.newPrice)}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1">
              <button
                onClick={() => openEdit(p)}
                className="rounded-lg p-2 text-gray-400 active:bg-gray-100"
                aria-label="Tahrirlash"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => remove(p)}
                className="rounded-lg p-2 text-gray-300 active:bg-red-50 active:text-red-500"
                aria-label="O'chirish"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Tahrirlash oynasi */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing?.id ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
        footer={
          <Button fullWidth size="lg" loading={saving} onClick={save}>
            Saqlash
          </Button>
        }
      >
        {editing && (
          <div className="space-y-3 px-5 pb-6">
            <ImagePicker
              token={token}
              label="Mahsulot rasmi"
              value={editing.imageUrl || ''}
              onChange={(url) => setEditing({ ...editing, imageUrl: url })}
            />

            <Input
              label="Nomi *"
              value={editing.title || ''}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />

            <Textarea
              label="Tavsif"
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />

            <Textarea
              label="Tarkibi va foydasi (har bir qatorda bitta)"
              rows={4}
              value={editing.ingredientsText || ''}
              onChange={(e) => setEditing({ ...editing, ingredientsText: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Eski narx"
                inputMode="numeric"
                value={editing.oldPrice ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, oldPrice: e.target.value ? Number(e.target.value) : null })
                }
              />
              <Input
                label="Yangi narx *"
                inputMode="numeric"
                value={editing.newPrice ?? ''}
                onChange={(e) => setEditing({ ...editing, newPrice: Number(e.target.value) })}
              />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-gray-700">Kategoriya</span>
              <select
                value={editing.categoryId ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, categoryId: e.target.value ? Number(e.target.value) : null })
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-brand-400"
              >
                <option value="">— tanlanmagan —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Tartib raqami"
              inputMode="numeric"
              value={editing.sortOrder ?? 0}
              onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
            />

            {/* Bayroqlar */}
            <div className="space-y-2.5 rounded-2xl bg-cream p-3.5">
              <ToggleRow
                label="Faol (do‘konda ko‘rinadi)"
                checked={editing.isActive !== false}
                onChange={(v) => setEditing({ ...editing, isActive: v })}
              />
              <ToggleRow
                label="🔥 Eng ko‘p sotilgan"
                checked={!!editing.isBestSeller}
                onChange={(v) => setEditing({ ...editing, isBestSeller: v })}
              />
              <ToggleRow
                label="🎁 Order Bump (savatchada taklif qilinadi)"
                checked={!!editing.isOrderBump}
                onChange={(v) => setEditing({ ...editing, isOrderBump: v })}
              />
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13.5px] font-medium text-gray-700">{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
