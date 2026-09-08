'use client';

/**
 * Admin: BANNER va STORIS boshqaruvi.
 *
 *  • STORIS — bosh sahifa tepasidagi to'rtburchak kartochkalar
 *    (chegirmalar, mijozlar sharhlari, keyslar)
 *  • BANNER — bosh sahifadagi katta reklama blokining orqa fon rasmi
 */
import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ImagePicker } from './ImagePicker';
import { adminApi } from '@/lib/api';
import type { Story } from '@/lib/types';
import { cn, FALLBACK_IMAGE } from '@/lib/utils';

type Draft = Partial<Story>;

export function StoriesTab({ token }: { token: string }) {
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminApi.getStories(token));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openNew = (type: 'STORY' | 'BANNER') => {
    setEditing({ title: '', subtitle: '', imageUrl: '', type, sortOrder: 0, isActive: true });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.imageUrl?.trim()) return alert('Avval rasm tanlang');
    setSaving(true);
    try {
      const body = {
        title: editing.title || '',
        subtitle: editing.subtitle || '',
        imageUrl: editing.imageUrl,
        linkUrl: editing.linkUrl || null,
        type: editing.type || 'STORY',
        sortOrder: Number(editing.sortOrder || 0),
        isActive: editing.isActive !== false,
      };
      if (editing.id) await adminApi.updateStory(token, editing.id, body);
      else await adminApi.createStory(token, body);
      setOpen(false);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Story) => {
    if (!confirm('O‘chirilsinmi?')) return;
    await adminApi.deleteStory(token, s.id);
    await load();
  };

  const stories = items.filter((i) => i.type === 'STORY');
  const banners = items.filter((i) => i.type === 'BANNER');

  const renderList = (list: Story[], empty: string) => {
    if (!list.length) {
      return (
        <p className="rounded-2xl bg-gray-50 py-6 text-center text-[13px] text-muted">{empty}</p>
      );
    }
    return (
      <ul className="space-y-2">
        {list.map((s) => (
          <li
            key={s.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl border border-gray-100 p-2.5',
              !s.isActive && 'opacity-50'
            )}
          >
            <div
              className={cn(
                'shrink-0 overflow-hidden rounded-lg bg-cream',
                s.type === 'BANNER' ? 'h-[46px] w-[74px]' : 'h-[56px] w-[44px]'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl || FALLBACK_IMAGE}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[13.5px] font-semibold text-ink">{s.title || '—'}</p>
              <p className="line-clamp-1 text-[11.5px] text-muted">{s.subtitle}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                Tartib: {s.sortOrder} · {s.isActive ? 'faol' : 'yashirilgan'}
              </p>
            </div>

            <button
              onClick={() => {
                setEditing(s);
                setOpen(true);
              }}
              className="rounded-lg p-2 text-gray-400 active:bg-gray-100"
              aria-label="Tahrirlash"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => remove(s)}
              className="rounded-lg p-2 text-gray-300 active:bg-red-50 active:text-red-500"
              aria-label="O'chirish"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-5">
      {loading && <p className="py-8 text-center text-[13px] text-muted">Yuklanmoqda…</p>}

      {/* ================= STORISLAR ================= */}
      <section className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
              <ImageIcon size={16} className="text-brand-500" />
              Storislar
            </h3>
            <p className="mt-0.5 text-[12px] leading-snug text-muted">
              Bosh sahifa tepasidagi to‘rtburchak kartochkalar — chegirmalar, mijozlar sharhlari,
              tayyorlangan buyurtmalar.
            </p>
          </div>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => openNew('STORY')}>
            Qo‘shish
          </Button>
        </div>
        {!loading && renderList(stories, 'Hali story qo‘shilmagan')}
      </section>

      {/* ================= BANNERLAR ================= */}
      <section className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
              <LayoutTemplate size={16} className="text-purple-500" />
              Bannerlar
            </h3>
            <p className="mt-0.5 text-[12px] leading-snug text-muted">
              Bosh sahifadagi katta reklama blokining orqa fon rasmi. Ustidagi yozuvlar
              <b className="text-gray-600"> Matnlar → Reklama bloki</b> bo‘limida tahrirlanadi.
            </p>
          </div>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => openNew('BANNER')}>
            Qo‘shish
          </Button>
        </div>
        {!loading && renderList(banners, 'Hali banner qo‘shilmagan')}
      </section>

      {/* ================= TAHRIRLASH OYNASI ================= */}
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={
          editing?.id
            ? editing.type === 'BANNER'
              ? 'Bannerni tahrirlash'
              : 'Storyni tahrirlash'
            : editing?.type === 'BANNER'
              ? 'Yangi banner'
              : 'Yangi story'
        }
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
              label={editing.type === 'BANNER' ? 'Banner rasmi (keng)' : 'Story rasmi (tik)'}
              value={editing.imageUrl || ''}
              onChange={(url) => setEditing({ ...editing, imageUrl: url })}
            />

            <Input
              label="Sarlavha"
              placeholder={editing.type === 'BANNER' ? 'Bugun buyurtma bering' : '-25% chegirma'}
              value={editing.title || ''}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <Input
              label="Qo‘shimcha matn"
              placeholder={editing.type === 'BANNER' ? 'Yetkazib berish bepul' : 'Faqat shu hafta'}
              value={editing.subtitle || ''}
              onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
            />

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-gray-700">Turi</span>
              <select
                value={editing.type || 'STORY'}
                onChange={(e) => setEditing({ ...editing, type: e.target.value as 'STORY' | 'BANNER' })}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-brand-400"
              >
                <option value="STORY">Story — bosh sahifa tepasidagi kartochka</option>
                <option value="BANNER">Banner — reklama blokining fon rasmi</option>
              </select>
            </label>

            <Input
              label="Tartib raqami"
              inputMode="numeric"
              value={editing.sortOrder ?? 0}
              onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
              hint="Kichik raqam oldinroq turadi"
            />

            <div className="flex items-center justify-between rounded-2xl bg-cream p-3.5">
              <span className="text-[13.5px] font-medium text-gray-700">Faol (do‘konda ko‘rinadi)</span>
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
