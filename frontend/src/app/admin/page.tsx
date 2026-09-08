'use client';

/**
 * 6-BO'LIM: Admin panel (yashirin bo'lim).
 * Oddiy foydalanuvchilarga ko'rinmaydi — alohida /admin yo'nalishi.
 * Kirish: maxfiy kod + Telegram ID tekshiruvi (backendda ham qayta tekshiriladi).
 */
import { useEffect, useState } from 'react';
import { LogOut, Package, LayoutGrid, Images, ClipboardList, BarChart3, Type } from 'lucide-react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { StoriesTab } from '@/components/admin/StoriesTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { ReportTab } from '@/components/admin/ReportTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { cn } from '@/lib/utils';

type Tab = 'report' | 'orders' | 'products' | 'categories' | 'stories' | 'content';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'report', label: 'Hisobot', icon: BarChart3 },
  { key: 'orders', label: 'Buyurtmalar', icon: ClipboardList },
  { key: 'products', label: 'Mahsulotlar', icon: Package },
  { key: 'categories', label: 'Kategoriya', icon: LayoutGrid },
  { key: 'stories', label: 'Banner va storis', icon: Images },
  { key: 'content', label: 'Matnlar', icon: Type },
];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>('report');

  // Saqlangan tokenni tiklaymiz
  useEffect(() => {
    try {
      setToken(localStorage.getItem('malohat-admin-token'));
    } catch {
      /* localStorage mavjud bo'lmasligi mumkin */
    }
    setChecked(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('malohat-admin-token');
    setToken(null);
  };

  if (!checked) {
    return <main className="min-h-dvh bg-white" />;
  }

  if (!token) {
    return <AdminLogin onSuccess={setToken} />;
  }

  return (
    <main className="min-h-dvh bg-white pb-8 lg:pb-16">
      {/* Sarlavha */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white lg:static">
        <div className="px-page mx-auto flex max-w-5xl items-center justify-between pb-3 pt-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Admin panel</h1>
            <p className="text-[12.5px] text-muted">Malohat pishiriqlari</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-[13px] font-semibold text-gray-600 active:bg-gray-200"
          >
            <LogOut size={15} />
            Chiqish
          </button>
        </div>

        {/* Bo'limlar */}
        <div className="scroll-x px-page mx-auto max-w-5xl pb-2.5 lg:flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'chip flex shrink-0 items-center gap-1.5',
                  tab === t.key ? 'chip-active' : 'chip-idle'
                )}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-page mx-auto max-w-5xl pt-4">
        {tab === 'report' && <ReportTab token={token} />}
        {tab === 'orders' && <OrdersTab token={token} />}
        {tab === 'products' && <ProductsTab token={token} />}
        {tab === 'categories' && <CategoriesTab token={token} />}
        {tab === 'stories' && <StoriesTab token={token} />}
        {tab === 'content' && <SettingsTab token={token} />}
      </div>
    </main>
  );
}
