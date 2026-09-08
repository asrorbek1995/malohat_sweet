import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';
import { TelegramProvider } from '@/providers/TelegramProvider';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { TopNavigation } from '@/components/layout/TopNavigation';

export const metadata: Metadata = {
  title: 'Malohat pishiriqlari',
  description: 'Uy sharoitida, sevgi bilan pishirilgan tort va shirinliklar',
  manifest: undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Telegram SDK <html> tegiga o'z stillarini qo'shadi — hydration ogohlantirishini o'chiramiz
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Chiroyli sarlavha shrifti + asosiy shrift */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Cormorant+Garamond:wght@600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Fon HAMMA joyda OQ */}
      <body className="min-h-dvh bg-white text-ink antialiased">
        {/* Telegram WebApp SDK */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

        <TelegramProvider>
          {/* Desktopda tepa menyu, telefon/planshetda pastki menyu */}
          <TopNavigation />
          <div className="mx-auto min-h-dvh w-full max-w-lg bg-white md:max-w-3xl lg:max-w-6xl">
            {children}
          </div>
          <BottomNavigation />
        </TelegramProvider>
      </body>
    </html>
  );
}
