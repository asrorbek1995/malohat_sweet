import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind klasslarini xavfsiz birlashtirish */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Do'kon valyutasi.
 * Dollarga o'tish uchun shu ikki qatorni o'zgartiring:
 *   CURRENCY = '$'  va  CURRENCY_POSITION = 'before'
 */
export const CURRENCY = "so'm";
export const CURRENCY_POSITION: 'before' | 'after' = 'after';

/** Narxni chiroyli ko'rinishga keltirish: 195000 -> "195 000 so'm" */
export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  const num = n.toLocaleString('ru-RU').replace(/ /g, ' ');
  return CURRENCY_POSITION === 'before' ? `${CURRENCY}${num}` : `${num} ${CURRENCY}`;
}

/** Chegirma foizini hisoblash */
export function discountPercent(oldPrice?: number | null, newPrice?: number | null): number | null {
  if (!oldPrice || !newPrice || oldPrice <= newPrice) return null;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

/** Sanani o'zbekcha formatda */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Buyurtma holatlarining o'zbekcha nomlari */
export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Yangi', color: 'bg-blue-100 text-blue-700' },
  CONFIRMED: { label: 'Tasdiqlangan', color: 'bg-amber-100 text-amber-700' },
  DELIVERED: { label: 'Yetkazilgan', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Bekor qilingan', color: 'bg-red-100 text-red-700' },
};

/** Rasm bo'lmasa — zaxira rasm */
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#fdf8f3"/><text x="50%" y="50%" font-size="90" text-anchor="middle" dy=".35em">🍰</text></svg>`
  );
