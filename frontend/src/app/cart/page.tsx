'use client';

/**
 * 5-EKRAN: Savatcha — konversiya nuqtasi.
 *  - Buyurtmalar ro'yxati va soni
 *  - Order Bump (Switch)
 *  - Jami narx (katta va aniq)
 *  - Rasmiylashtirish -> backend -> adminga Telegram xabari
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { PageHeader } from '@/components/layout/Header';
import { CartList } from '@/components/features/CartList';
import { OrderBump } from '@/components/features/OrderBump';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import { useSettings } from '@/hooks/useSettings';

export default function CartPage() {
  const { items, hydrated, subtotalValue, bumpValue, totalValue, count, setBumpProduct, syncWith, clear, toPayload } =
    useCart();
  const { telegramId, user, haptic, alert: tgAlert, close } = useTelegram();
  const { t } = useSettings();

  const [bump, setBump] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: number; total: number } | null>(null);

  // Asosiy CTA tugma ekranda ko'rinib turibdimi?
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [ctaVisible, setCtaVisible] = useState(true);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), {
      rootMargin: '-90px 0px -90px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, done]);

  // Order Bump mahsulotini olamiz va savatdagi narxlarni bazadagi holat bilan yangilaymiz
  useEffect(() => {
    (async () => {
      try {
        const [product, all] = await Promise.all([api.getOrderBump(), api.getProducts()]);
        setBump(product);
        setBumpProduct(product);
        // Savat localStorage'da saqlanadi — narx o'zgargan bo'lsa, yangisini ko'rsatamiz
        syncWith(product ? [...all, product] : all);
      } catch {
        /* backend javob bermasa — savat o'z holicha qoladi */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Telegram foydalanuvchisining ismini avtomatik qo'yamiz
  useEffect(() => {
    if (user && !form.name) {
      setForm((f) => ({ ...f, name: [user.first_name, user.last_name].filter(Boolean).join(' ') }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Ismingizni kiriting';
    if (form.phone.replace(/\D/g, '').length < 9) e.phone = 'To‘g‘ri telefon raqam kiriting';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      haptic('error');
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || undefined,
        comment: form.comment.trim() || undefined,
        telegramId: telegramId || undefined,
        username: user?.username,
        items: toPayload(),
      });

      haptic('success');
      setDone({ id: order.id, total: order.totalAmount });
      clear();
    } catch (err) {
      haptic('error');
      tgAlert(err instanceof Error ? err.message : 'Buyurtmani yuborib bo‘lmadi');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Buyurtma qabul qilindi ----------
  if (done) {
    return (
      <main className="pb-nav flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
        <div className="flex h-20 w-20 animate-scale-in items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={44} className="text-green-600" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink">{t('order_success_title')}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Buyurtma raqami: <b className="text-ink">#{done.id}</b>
          <br />
          Jami summa: <b className="price-new">{formatPrice(done.total)}</b>
        </p>
        <p className="mt-3 text-[13.5px] text-muted">
          {t('order_success_text')}
        </p>

        <div className="mt-7 w-full max-w-xs space-y-2.5">
          <Link href="/catalog">
            <Button fullWidth size="lg">
              Yana buyurtma berish
            </Button>
          </Link>
          <Button fullWidth variant="ghost" onClick={() => close()}>
            Yopish
          </Button>
        </div>
      </main>
    );
  }

  // ---------- Bo'sh savat ----------
  if (hydrated && items.length === 0) {
    return (
      <main className="pb-nav flex min-h-dvh flex-col bg-white">
        <PageHeader title="Savatcha" />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream text-4xl">
            🛒
          </div>
          <p className="mt-4 font-display text-xl font-bold text-ink">{t('cart_empty_title')}</p>
          <p className="mt-1.5 text-[13.5px] text-muted">
            {t('cart_empty_text')}
          </p>
          <Link href="/catalog" className="mt-6 w-full max-w-xs">
            <Button fullWidth size="lg" icon={<ShoppingBag size={19} />}>
              Katalogga o‘tish
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-nav min-h-dvh bg-white">
      <PageHeader title="Savatcha" subtitle={`${count} ta mahsulot tanlandi`} />

      <div className="px-page space-y-5 pt-4 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8 lg:space-y-0">
        {/* --- Chap ustun: mahsulotlar, bonus va forma --- */}
        <div className="space-y-5">
        {/* ---------- Buyurtmalar ro'yxati ---------- */}
        <CartList />

        {/* ---------- Order Bump (qo'shimcha savdo) ---------- */}
        <OrderBump product={bump} />

        {/* ---------- Mijoz ma'lumotlari ---------- */}
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold text-ink">{t('cart_form_title')}</h3>

          <Input
            label="Ismingiz *"
            placeholder="Masalan: Nilufar"
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Telefon raqamingiz *"
            type="tel"
            inputMode="tel"
            placeholder="+998 90 123 45 67"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Manzil"
            placeholder="Tuman, ko‘cha, uy raqami"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Textarea
            label="Izoh (ixtiyoriy)"
            placeholder="Tortga yozuv, yetkazish vaqti va h.k."
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>

        </div>

        {/* --- O'ng ustun: hisob-kitob va rasmiylashtirish --- */}
        <div className="space-y-5 lg:sticky lg:top-[88px]">
        {/* ---------- Hisob-kitob ---------- */}
        <div className="rounded-2xl bg-cream p-4">
          <div className="flex justify-between text-[14px] text-gray-600">
            <span>Mahsulotlar ({count} ta)</span>
            <span className="font-semibold text-ink">{formatPrice(subtotalValue)}</span>
          </div>

          {bumpValue > 0 && (
            <div className="mt-2 flex justify-between text-[14px] text-gray-600">
              <span>🎁 Bonus qo‘shimcha</span>
              <span className="font-semibold text-ink">{formatPrice(bumpValue)}</span>
            </div>
          )}

          <div className="mt-2 flex justify-between text-[14px] text-gray-600">
            <span>{t('cart_delivery_label')}</span>
            <span className="font-semibold text-green-600">{t('cart_delivery_value')}</span>
          </div>

          <div className="my-3 border-t border-dashed border-gray-300" />

          {/* Jami narx — katta va aniq */}
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-bold text-ink">Jami to‘lov</span>
            <span className="price-new text-[26px] leading-none">{formatPrice(totalValue)}</span>
          </div>
        </div>

        {/* ---------- Rasmiylashtirish tugmasi ---------- */}
        <div ref={ctaRef}>
          <Button size="lg" fullWidth loading={submitting} onClick={handleSubmit}>
            {submitting ? 'Yuborilmoqda…' : `${t('cart_submit_button')} — ${formatPrice(totalValue)}`}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted">
            {t('cart_submit_note')}
          </p>
        </div>

        {/* ---------- Kafolat belgilari ---------- */}
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-100 p-2.5">
            <ShieldCheck size={17} className="shrink-0 text-green-600" />
            <span className="text-[11.5px] font-semibold leading-tight text-gray-600">
              {t('cart_badge_left')}
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-100 p-2.5">
            <Truck size={17} className="shrink-0 text-green-600" />
            <span className="text-[11.5px] font-semibold leading-tight text-gray-600">
              {t('cart_badge_right')}
            </span>
          </div>
        </div>
        </div>
      </div>

      {/*
        Yopishqoq CTA — faqat asosiy tugma ekrandan chiqib ketganda ko'rinadi,
        shunda forma maydonlari to'silib qolmaydi.
      */}
      {!ctaVisible && (
        <div
          className="fixed inset-x-0 z-30 animate-fade-in border-t border-gray-100 bg-white/95 px-5 pt-3 backdrop-blur lg:hidden"
          style={{
            bottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))',
            paddingBottom: '12px',
          }}
        >
          <div className="mx-auto max-w-lg">
            <Button size="lg" fullWidth loading={submitting} onClick={handleSubmit}>
              {submitting ? 'Yuborilmoqda…' : `Rasmiylashtirish — ${formatPrice(totalValue)}`}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
