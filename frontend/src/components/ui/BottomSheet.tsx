'use client';

/**
 * Pastdan tepaga chiquvchi oyna (Bottom Sheet).
 * Mahsulot haqidagi ma'lumot shu oynada ochiladi — yangi sahifaga o'tilmaydi.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Pastga yopishtiriladigan CTA qismi */
  footer?: ReactNode;
  title?: string;
  className?: string;
}

export function BottomSheet({ open, onClose, children, footer, title, className }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);

  /**
   * `open` o'zgarishini kuzatamiz.
   * Oyna ham ichkaridan (X / fon / surish), ham tashqaridan (masalan "Saqlash"dan keyin)
   * yopilishi mumkin — ikkala holatda ham yopilish animatsiyasi shu yerda boshqariladi.
   */
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      setDragY(0);
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }

    // Yopilmoqda — animatsiya tugagach DOM'dan olib tashlaymiz
    setClosing(true);
    document.body.style.overflow = '';
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
      setDragY(0);
    }, 220);
    return () => clearTimeout(timer);
  }, [open]);

  // Escape tugmasi
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Yopilishni ota-komponentga bildiramiz; animatsiyani yuqoridagi effect boshqaradi
  const handleClose = () => onClose();

  // Pastga surib yopish
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  };
  const onTouchEnd = () => {
    if (dragY > 110) handleClose();
    else setDragY(0);
  };

  if (!open && !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Fon qoraytirgichi */}
      <div
        onClick={handleClose}
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-200',
          closing ? 'opacity-0' : 'animate-fade-in opacity-100'
        )}
      />

      {/* Oynaning o'zi */}
      <div
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
        className={cn(
          'relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-sheet',
          // Desktopda pastdan chiquvchi oyna emas — markazdagi modal
          'lg:max-h-[88vh] lg:max-w-2xl lg:rounded-3xl',
          closing
            ? 'translate-y-full transition-transform duration-200 lg:translate-y-0 lg:opacity-0'
            : 'animate-slide-up lg:animate-scale-in',
          className
        )}
      >
        {/* Tortish uchun chiziq */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="flex shrink-0 cursor-grab justify-center pb-1 pt-3 lg:hidden"
        >
          <span className="h-1.5 w-11 rounded-full bg-gray-300" />
        </div>

        {title && (
          <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4 lg:pt-6">
            <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
            <button onClick={handleClose} className="rounded-full p-1.5 text-gray-400 active:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Skroll qilinadigan kontent */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {/* Yopishqoq pastki qism */}
        {footer && (
          <div
            className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3"
            style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
