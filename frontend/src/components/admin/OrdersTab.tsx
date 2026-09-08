'use client';

/**
 * Admin: buyurtmalar ro'yxati va holatini o'zgartirish.
 */
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/types';
import { formatDateTime, formatPrice, ORDER_STATUS, cn } from '@/lib/utils';

const FILTERS: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Barchasi' },
  { key: 'NEW', label: 'Yangi' },
  { key: 'CONFIRMED', label: 'Tasdiqlangan' },
  { key: 'DELIVERED', label: 'Yetkazilgan' },
  { key: 'CANCELLED', label: 'Bekor' },
];

export function OrdersTab({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await adminApi.getOrders(token));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    try {
      await adminApi.updateOrderStatus(token, order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const visible = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">{visible.length} ta buyurtma</p>
        <Button size="sm" variant="secondary" onClick={load} icon={<RefreshCw size={15} />}>
          Yangilash
        </Button>
      </div>

      <div className="scroll-x">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn('chip shrink-0', filter === f.key ? 'chip-active' : 'chip-idle')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="py-8 text-center text-[13px] text-muted">Yuklanmoqda…</p>}
      {!loading && visible.length === 0 && (
        <p className="py-10 text-center text-[13px] text-muted">Buyurtmalar yo‘q</p>
      )}

      <ul className="space-y-2.5">
        {visible.map((o) => {
          const status = ORDER_STATUS[o.status];
          return (
            <li key={o.id} className="rounded-2xl border border-gray-100 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[14.5px] font-bold text-ink">#{o.id} · {o.customerName}</p>
                  <p className="text-[11.5px] text-muted">{formatDateTime(o.createdAt)}</p>
                </div>
                <span className={cn('rounded-lg px-2 py-1 text-[11px] font-bold', status.color)}>
                  {status.label}
                </span>
              </div>

              {o.phone && (
                <a href={`tel:${o.phone}`} className="mt-1.5 block text-[13px] font-semibold text-brand-600">
                  {o.phone}
                </a>
              )}
              {o.address && <p className="text-[12.5px] text-muted">{o.address}</p>}
              {o.comment && <p className="mt-1 text-[12.5px] italic text-muted">“{o.comment}”</p>}

              <ul className="mt-2 space-y-1 border-t border-dashed border-gray-200 pt-2">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between text-[12.5px] text-gray-600">
                    <span className="truncate pr-2">
                      {it.isBump ? '🎁 ' : ''}
                      {it.title} × {it.quantity}
                    </span>
                    <span className="shrink-0 font-semibold">{formatPrice(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-[13px] font-semibold text-ink">Jami</span>
                <span className="price-new text-[16px]">{formatPrice(o.totalAmount)}</span>
              </div>

              <div className="mt-2.5 flex gap-2">
                {o.status !== 'CONFIRMED' && o.status !== 'DELIVERED' && (
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => changeStatus(o, 'CONFIRMED')}>
                    ✅ Tasdiqlash
                  </Button>
                )}
                {o.status !== 'DELIVERED' && (
                  <Button size="sm" className="flex-1" onClick={() => changeStatus(o, 'DELIVERED')}>
                    🚚 Yetkazildi
                  </Button>
                )}
                {o.status !== 'CANCELLED' && (
                  <Button size="sm" variant="ghost" onClick={() => changeStatus(o, 'CANCELLED')}>
                    ❌
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
