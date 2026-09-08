'use client';

/**
 * Admin: statistika va hisobotlar.
 * Admin hisobot davrini o'zi tanlaydi: 7 kunlik yoki 30 kunlik (yoki 1 kun).
 */
import { useEffect, useState } from 'react';
import { TrendingUp, Package, Users, Wallet, ShoppingCart, Trophy } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ReportData } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

const PERIODS = [
  { days: 1, label: 'Bugun' },
  { days: 7, label: '7 kunlik' },
  { days: 30, label: '30 kunlik' },
];

export function ReportTab({ token }: { token: string }) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .getReport(token, days)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Xatolik'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, days]);

  const maxRevenue = data ? Math.max(...data.chart.map((c) => c.revenue), 1) : 1;

  return (
    <div className="space-y-4">
      {/* Davrni tanlash */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            className={cn('chip flex-1', days === p.days ? 'chip-active' : 'chip-idle')}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-2xl bg-red-50 p-3 text-[13px] text-red-600">{error}</div>}
      {loading && <p className="py-10 text-center text-[13px] text-muted">Hisobot tayyorlanmoqda…</p>}

      {data && !loading && (
        <>
          {/* Asosiy ko'rsatkichlar */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              icon={Wallet}
              label="Tushum"
              value={formatPrice(data.revenue)}
              tone="bg-green-50 text-green-600"
            />
            <StatCard
              icon={ShoppingCart}
              label="Buyurtmalar"
              value={String(data.totalOrders)}
              sub={`${data.cancelledOrders} bekor qilingan`}
              tone="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={Package}
              label="Sotilgan mahsulot"
              value={`${data.soldItems} dona`}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              icon={TrendingUp}
              label="O‘rtacha chek"
              value={formatPrice(data.averageCheck)}
              tone="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon={Users}
              label="Foydalanuvchilar"
              value={String(data.totalUsers)}
              sub={`+${data.newUsers} yangi`}
              tone="bg-rose-50 text-rose-600"
            />
            <StatCard
              icon={Package}
              label="Faol mahsulotlar"
              value={String(data.totalProducts)}
              tone="bg-teal-50 text-teal-600"
            />
          </div>

          {/* Kunlar bo'yicha grafik */}
          <div className="rounded-2xl border border-gray-100 p-4">
            <h4 className="mb-3 text-[14px] font-bold text-ink">Kunlik tushum</h4>
            <div className="flex h-32 items-end gap-1">
              {data.chart.map((c) => (
                <div key={c.date} className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className={cn(
                      'w-full rounded-t transition-all',
                      c.revenue > 0 ? 'bg-brand-400' : 'bg-gray-200'
                    )}
                    style={{ height: `${Math.max(3, (c.revenue / maxRevenue) * 100)}%` }}
                    title={`${c.date}: ${formatPrice(c.revenue)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted">
              <span>{data.chart[0]?.date.slice(5)}</span>
              <span>{data.chart[data.chart.length - 1]?.date.slice(5)}</span>
            </div>
          </div>

          {/* Holatlar */}
          <div className="rounded-2xl border border-gray-100 p-4">
            <h4 className="mb-2.5 text-[14px] font-bold text-ink">Buyurtmalar holati</h4>
            <div className="space-y-1.5">
              {(
                [
                  ['NEW', 'Yangi', 'bg-blue-500'],
                  ['CONFIRMED', 'Tasdiqlangan', 'bg-amber-500'],
                  ['DELIVERED', 'Yetkazilgan', 'bg-green-500'],
                  ['CANCELLED', 'Bekor qilingan', 'bg-red-500'],
                ] as const
              ).map(([key, label, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
                  <span className="flex-1 text-[13px] text-gray-600">{label}</span>
                  <span className="text-[13px] font-bold text-ink">{data.statusBreakdown[key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eng ko'p sotilganlar */}
          <div className="rounded-2xl border border-gray-100 p-4">
            <h4 className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink">
              <Trophy size={16} className="text-amber-500" />
              Eng ko‘p sotilgan mahsulotlar
            </h4>
            {data.topProducts.length === 0 ? (
              <p className="py-3 text-center text-[13px] text-muted">Bu davrda sotuv bo‘lmagan</p>
            ) : (
              <ol className="space-y-2">
                {data.topProducts.map((p, i) => (
                  <li key={p.title} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold',
                        i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-gray-700">{p.title}</span>
                    <span className="shrink-0 text-[12px] font-semibold text-muted">{p.quantity} dona</span>
                    <span className="shrink-0 text-[13px] font-bold text-ink">{formatPrice(p.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 p-3.5">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', tone)}>
        <Icon size={17} />
      </span>
      <p className="mt-2 text-[11.5px] text-muted">{label}</p>
      <p className="text-[16px] font-bold leading-tight text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}
