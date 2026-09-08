'use client';

/**
 * Telegram WebApp SDK bilan ishlash konteksti.
 * SDK skripti layout.tsx da yuklanadi; bu provider uni ishga tayyorlaydi.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { TelegramUser, TelegramWebApp } from '@/lib/telegram';

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  /** Foydalanuvchi ismi (xush kelibsiz matni uchun) */
  firstName: string;
  telegramId: string | null;
  isReady: boolean;
  /** Brauzerda (Telegram'dan tashqarida) ochilganmi? */
  isBrowser: boolean;
  haptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  user: null,
  firstName: 'mehmon',
  telegramId: null,
  isReady: false,
  isBrowser: true,
  haptic: () => {},
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let tries = 0;

    // SDK skripti asinxron yuklanadi — biroz kutamiz
    const init = () => {
      const tg = window.Telegram?.WebApp;

      if (!tg) {
        if (tries++ < 20) {
          setTimeout(init, 100);
        } else {
          setIsReady(true); // Brauzer rejimi
        }
        return;
      }

      tg.ready();
      tg.expand();

      // Fon HAMMA joyda OQ bo'lishi shart
      try {
        tg.setBackgroundColor('#ffffff');
        tg.setHeaderColor('#ffffff');
        tg.disableVerticalSwipes?.();
      } catch {
        /* eski Telegram versiyalarida bu metodlar bo'lmasligi mumkin */
      }

      setWebApp(tg);
      setIsReady(true);
    };

    init();
  }, []);

  const value = useMemo<TelegramContextValue>(() => {
    const user = webApp?.initDataUnsafe?.user ?? null;
    return {
      webApp,
      user,
      firstName: user?.first_name || 'mehmon',
      telegramId: user ? String(user.id) : null,
      isReady,
      isBrowser: !webApp,
      haptic: (type = 'light') => {
        try {
          if (!webApp) return;
          if (type === 'success' || type === 'error') {
            webApp.HapticFeedback.notificationOccurred(type);
          } else {
            webApp.HapticFeedback.impactOccurred(type);
          }
        } catch {
          /* haptic qo'llab-quvvatlanmasa — e'tiborsiz */
        }
      },
    };
  }, [webApp, isReady]);

  return (
    <TelegramContext.Provider value={value}>
      <div className="tg-root">{children}</div>
    </TelegramContext.Provider>
  );
}

export const useTelegramContext = () => useContext(TelegramContext);
