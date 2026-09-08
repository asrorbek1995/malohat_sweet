'use client';

/**
 * Telegram WebApp bilan ishlash uchun qulay hook.
 */
import { useCallback } from 'react';
import { useTelegramContext } from '@/providers/TelegramProvider';

export function useTelegram() {
  const ctx = useTelegramContext();
  const { webApp } = ctx;

  /** Ma'lumotni bot'ga yuborish (Web App -> bot) */
  const sendData = useCallback(
    (payload: unknown) => {
      if (!webApp) return false;
      webApp.sendData(JSON.stringify(payload));
      return true;
    },
    [webApp]
  );

  /** Mini App'ni yopish */
  const close = useCallback(() => webApp?.close(), [webApp]);

  /** Telegram'ning o'z ogohlantirish oynasi (brauzerda — oddiy alert) */
  const alert = useCallback(
    (message: string) => {
      if (webApp) webApp.showAlert(message);
      else window.alert(message);
    },
    [webApp]
  );

  /** Tasdiqlash oynasi */
  const confirm = useCallback(
    (message: string): Promise<boolean> =>
      new Promise((resolve) => {
        if (webApp) webApp.showConfirm(message, (ok) => resolve(ok));
        else resolve(window.confirm(message));
      }),
    [webApp]
  );

  /** Pastdagi asosiy tugmani boshqarish */
  const mainButton = useCallback(
    (params: { text: string; onClick: () => void; visible?: boolean }) => {
      if (!webApp) return () => {};
      const { MainButton } = webApp;
      MainButton.setText(params.text);
      MainButton.onClick(params.onClick);
      if (params.visible === false) MainButton.hide();
      else MainButton.show();
      return () => {
        MainButton.offClick(params.onClick);
        MainButton.hide();
      };
    },
    [webApp]
  );

  return { ...ctx, sendData, close, alert, confirm, mainButton };
}
