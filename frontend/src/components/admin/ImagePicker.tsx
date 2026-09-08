'use client';

/**
 * Rasm tanlash: galereyadan yuklash, avval yuklanganlardan tanlash yoki URL kiritish.
 */
import { useEffect, useRef, useState } from 'react';
import { Upload, Link2, Images, Trash2, Check, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { UploadedImage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ImagePickerProps {
  token: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImagePicker({ token, value, onChange, label = 'Rasm' }: ImagePickerProps) {
  const [mode, setMode] = useState<'upload' | 'gallery' | 'url'>('upload');
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const loadGallery = async () => {
    try {
      setUploads(await adminApi.getUploads(token));
    } catch {
      /* galereya bo'sh bo'lishi mumkin */
    }
  };

  useEffect(() => {
    if (mode === 'gallery') loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded = await adminApi.uploadImage(token, files[0]);
      onChange(uploaded.url);
      setUploads((prev) => [uploaded, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yuklashda xatolik');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeUpload = async (name: string) => {
    if (!confirm('Bu rasm butunlay o‘chirilsinmi?')) return;
    try {
      await adminApi.deleteUpload(token, name);
      setUploads((prev) => prev.filter((u) => u.name !== name));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'O‘chirishda xatolik');
    }
  };

  const TABS = [
    { key: 'upload' as const, label: 'Galereyadan', icon: Upload },
    { key: 'gallery' as const, label: 'Yuklanganlar', icon: Images },
    { key: 'url' as const, label: 'URL', icon: Link2 },
  ];

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-gray-700">{label}</span>

      {/* Tanlangan rasm */}
      {value ? (
        <div className="relative mb-2.5 aspect-video w-full overflow-hidden rounded-2xl bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white backdrop-blur active:bg-black/75"
            aria-label="Rasmni olib tashlash"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="mb-2.5 flex aspect-video w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-[13px] text-muted">
          Rasm tanlanmagan
        </div>
      )}

      {/* Rejim tanlash */}
      <div className="mb-2.5 flex gap-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-semibold transition-colors',
                mode === tab.key ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- Galereyadan yuklash --- */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/60 px-4 py-6 text-center active:bg-brand-100 disabled:opacity-60"
          >
            {busy ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
            ) : (
              <Upload size={22} className="text-brand-500" />
            )}
            <span className="text-[13.5px] font-semibold text-brand-700">
              {busy ? 'Yuklanmoqda…' : 'Rasm tanlash'}
            </span>
            <span className="text-[11.5px] text-muted">
              Telefon yoki kompyuter galereyasidan · JPG, PNG, WEBP · 4 MB gacha
            </span>
          </button>
        </div>
      )}

      {/* --- Avval yuklangan rasmlar --- */}
      {mode === 'gallery' && (
        <div>
          {uploads.length === 0 ? (
            <p className="rounded-2xl bg-gray-50 py-6 text-center text-[13px] text-muted">
              Hali rasm yuklanmagan
            </p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-2xl bg-gray-50 p-2">
              {uploads.map((img) => (
                <div key={img.name} className="group relative aspect-square overflow-hidden rounded-xl bg-white">
                  <button type="button" onClick={() => onChange(img.url)} className="h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>

                  {value === img.url && (
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-500/45">
                      <Check size={22} className="text-white" strokeWidth={3} />
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeUpload(img.name)}
                    className="absolute right-1 top-1 rounded-lg bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="O'chirish"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- URL orqali --- */}
      {mode === 'url' && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-brand-400"
        />
      )}

      {error && <p className="mt-2 text-[12px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
