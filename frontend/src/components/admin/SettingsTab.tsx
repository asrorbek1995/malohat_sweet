'use client';

/**
 * Admin: do'kondagi BARCHA matnlarni tahrirlash.
 * Reklama bloki, afzalliklar, sharhlar, kafolatlar, bot matnlari — hammasi shu yerdan.
 */
import { useEffect, useState } from 'react';
import { RotateCcw, Save, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import type { ContentGroup } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SettingsTab({ token }: { token: string }) {
  const [groups, setGroups] = useState<ContentGroup[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings(token);
      setGroups(data.groups);
      setValues(data.values);
      setDirty({});
      setOpen((prev) => prev ?? data.groups[1]?.title ?? data.groups[0]?.title ?? null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Matnlarni yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const change = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty((d) => ({ ...d, [key]: value }));
    setMessage(null);
  };

  const save = async () => {
    if (!Object.keys(dirty).length) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(token, dirty);
      setValues(updated);
      setDirty({});
      setMessage('Matnlar saqlandi ✅ Do‘konda darhol ko‘rinadi.');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const reset = async (key: string) => {
    if (!confirm('Bu matn boshlang‘ich holatiga qaytarilsinmi?')) return;
    try {
      const updated = await adminApi.resetSetting(token, key);
      setValues(updated);
      setDirty((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const dirtyCount = Object.keys(dirty).length;

  if (loading) return <p className="py-10 text-center text-[13px] text-muted">Yuklanmoqda…</p>;

  return (
    <div className="space-y-3 pb-24">
      <div className="rounded-2xl bg-cream p-3.5">
        <p className="text-[13px] leading-snug text-gray-600">
          Do‘kondagi barcha yozuvlar — reklama bloki, afzalliklar, sharhlar va bot xabarlari —
          shu yerdan tahrirlanadi. Saqlagandan so‘ng o‘zgarish darhol ko‘rinadi.
        </p>
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-3 text-[13px] text-red-600">{error}</div>}
      {message && (
        <div className="rounded-2xl bg-green-50 p-3 text-[13px] text-green-700">{message}</div>
      )}

      {groups.map((group) => {
        const isOpen = open === group.title;
        const groupDirty = group.fields.filter((f) => dirty[f.key] !== undefined).length;

        return (
          <section key={group.title} className="overflow-hidden rounded-2xl border border-gray-100">
            <button
              onClick={() => setOpen(isOpen ? null : group.title)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left active:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-ink">{group.title}</span>
                {groupDirty > 0 && (
                  <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {groupDirty}
                  </span>
                )}
              </span>
              <ChevronDown
                size={18}
                className={cn('shrink-0 text-gray-400 transition-transform', isOpen && 'rotate-180')}
              />
            </button>

            {isOpen && (
              <div className="space-y-3.5 border-t border-gray-100 px-4 py-4">
                {group.fields.map((field) => (
                  <div key={field.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-gray-700">{field.label}</span>
                      <button
                        onClick={() => reset(field.key)}
                        title="Boshlang'ich holatga qaytarish"
                        className="rounded-lg p-1 text-gray-300 active:bg-gray-100 active:text-gray-600"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>

                    {field.type === 'text' ? (
                      <input
                        value={values[field.key] ?? ''}
                        onChange={(e) => change(field.key, e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-brand-400"
                      />
                    ) : (
                      <textarea
                        rows={field.type === 'rows' ? 5 : 3}
                        value={values[field.key] ?? ''}
                        onChange={(e) => change(field.key, e.target.value)}
                        className="w-full resize-y rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-mono text-[13px] leading-relaxed outline-none focus:border-brand-400"
                      />
                    )}

                    {field.hint && (
                      <p className="mt-1 text-[11px] text-muted">{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Saqlash paneli */}
      {dirtyCount > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 animate-fade-in border-t border-gray-100 bg-white/95 px-5 py-3 backdrop-blur"
          style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <span className="shrink-0 text-[12.5px] font-semibold text-muted">
              {dirtyCount} ta o‘zgarish
            </span>
            <Button fullWidth loading={saving} onClick={save} icon={<Save size={17} />}>
              Saqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
