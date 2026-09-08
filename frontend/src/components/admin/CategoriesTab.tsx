'use client';

/**
 * Admin: kategoriyalarni boshqarish.
 */
import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { adminApi } from '@/lib/api';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

type Draft = Partial<Category>;

export function CategoriesTab({ token }: { token: string }) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminApi.getCategories(token));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const save = async () => {
    if (!editing?.name?.trim()) return alert('Kategoriya nomini kiriting');
    setSaving(true);
    try {
      const body = {
        name: editing.name,
        emoji: editing.emoji || '',
        sortOrder: Number(editing.sortOrder || 0),
        isActive: editing.isActive !== false,
      };
      if (editing.id) await adminApi.updateCategory(token, editing.id, body);
      else await adminApi.createCategory(token, body);
      setOpen(false);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`"${c.name}" kategoriyasi o'chirilsinmi?`)) return;
    try {
      await adminApi.deleteCategory(token, c.id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'O‘chirishda xatolik');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">{items.length} ta kategoriya</p>
        <Button
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditing({ name: '', emoji: '', sortOrder: 0, isActive: true });
            setOpen(true);
          }}
        >
          Qo‘shish
        </Button>
      </div>

      {loading && <p className="py-8 text-center text-[13px] text-muted">Yuklanmoqda…</p>}

      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl border border-gray-100 p-3',
              !c.isActive && 'opacity-50'
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-lg">
              {c.emoji || '📦'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-ink">{c.name}</p>
              <p className="text-[11.5px] text-muted">
                {c._count?.products ?? 0} ta mahsulot · tartib: {c.sortOrder}
              </p>
            </div>
            <button
              onClick={() => {
                setEditing(c);
                setOpen(true);
              }}
              className="rounded-lg p-2 text-gray-400 active:bg-gray-100"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => remove(c)}
              className="rounded-lg p-2 text-gray-300 active:bg-red-50 active:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing?.id ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        footer={
          <Button fullWidth size="lg" loading={saving} onClick={save}>
            Saqlash
          </Button>
        }
      >
        {editing && (
          <div className="space-y-3 px-5 pb-6">
            <Input
              label="Nomi *"
              value={editing.name || ''}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <Input
              label="Emoji"
              placeholder="🎂"
              value={editing.emoji || ''}
              onChange={(e) => setEditing({ ...editing, emoji: e.target.value })}
            />
            <Input
              label="Tartib raqami"
              inputMode="numeric"
              value={editing.sortOrder ?? 0}
              onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
            />
            <div className="flex items-center justify-between rounded-2xl bg-cream p-3.5">
              <span className="text-[13.5px] font-medium text-gray-700">Faol</span>
              <Switch
                checked={editing.isActive !== false}
                onChange={(v) => setEditing({ ...editing, isActive: v })}
              />
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
