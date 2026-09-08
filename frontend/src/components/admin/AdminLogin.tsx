'use client';

/**
 * Admin panelga kirish — faqat Telegram bot yuborgan 4 xonali kod bilan.
 *
 * Tartib: botda /admin -> bot 4 xonali kod yuboradi -> shu yerga kiritiladi.
 */
import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Send, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';

const LENGTH = 4;

export function AdminLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const { webApp } = useTelegram();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
    adminApi
      .getBotLink()
      .then((d) => setBotUrl(d.url))
      .catch(() => {});
  }, []);

  const code = digits.join('');

  const submit = async (value: string) => {
    setError(null);
    setLoading(true);
    try {
      const token = await adminApi.login(value);
      localStorage.setItem('malohat-admin-token', token);
      onSuccess(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kirishda xatolik');
      setDigits(Array(LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      setDigits((d) => d.map((x, i) => (i === index ? '' : x)));
      return;
    }

    // Kod to'liq nusxalab qo'yilgan bo'lsa — barcha katakchalarga tarqatamiz
    if (clean.length > 1) {
      const next = clean.slice(0, LENGTH).split('');
      const filled = Array(LENGTH)
        .fill('')
        .map((_, i) => next[i] ?? '');
      setDigits(filled);
      if (filled.every(Boolean)) submit(filled.join(''));
      else inputs.current[filled.findIndex((x) => !x)]?.focus();
      return;
    }

    const next = digits.map((x, i) => (i === index ? clean : x));
    setDigits(next);

    if (index < LENGTH - 1) inputs.current[index + 1]?.focus();
    if (next.every(Boolean)) submit(next.join(''));
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && code.length === LENGTH) submit(code);
  };

  const openBot = () => {
    if (!botUrl) return;
    // Telegram ichida bo'lsak — mini app'ni yopib botga qaytamiz
    if (webApp) webApp.close();
    else window.open(`${botUrl}?start=admin`, '_blank');
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-ink text-white">
          <KeyRound size={28} />
        </div>

        <h1 className="mt-5 text-center font-display text-2xl font-bold text-ink">Admin panel</h1>
        <p className="mt-2 text-center text-[13.5px] leading-relaxed text-muted">
          Kirish uchun Telegram botda <b className="text-ink">/admin</b> buyrug‘ini yuboring —
          bot sizga <b className="text-ink">4 xonali kod</b> yuboradi.
        </p>

        {/* 4 xonali kod katakchalari */}
        <div className="mt-7 flex justify-center gap-2.5">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={LENGTH}
              disabled={loading}
              aria-label={`${i + 1}-raqam`}
              className={cn(
                'h-16 w-14 rounded-2xl border-2 bg-white text-center font-display text-[28px] font-bold text-ink outline-none transition-all',
                'focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                error ? 'border-red-300' : digit ? 'border-brand-400' : 'border-gray-200',
                loading && 'opacity-60'
              )}
            />
          ))}
        </div>

        {loading && (
          <p className="mt-4 text-center text-[13px] font-medium text-brand-600">Tekshirilmoqda…</p>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-[13px] text-red-600">
            <ShieldAlert size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-2.5">
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={openBot}
            disabled={!botUrl}
            icon={<Send size={17} />}
          >
            Botni ochib kod olish
          </Button>

          <p className="text-center text-[11.5px] leading-relaxed text-muted">
            Kod 5 daqiqa amal qiladi va bir marta ishlatiladi.
            <br />
            Uni faqat administratorning shaxsiy chatiga bot yuboradi.
          </p>
        </div>
      </div>
    </main>
  );
}
