/** @type {import('next').NextConfig} */

// Backend manzili — Next.js server tomonida proksi qilinadi.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,

  // Loyihada ikkita lockfile bor (ildiz va frontend) — ildizni aniq ko'rsatamiz
  outputFileTracingRoot: process.cwd(),

  // Admin istalgan URL orqali rasm qo'sha oladi — shuning uchun barcha manbalarga ruxsat
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  /**
   * MUHIM: Mini App telefonda HTTPS tunnel domeni orqali ochiladi —
   * u yerda "localhost:4000" mavjud emas. Shuning uchun barcha API so'rovlari
   * shu sahifaning o'z domenidan (/api/...) o'tadi va Next.js ularni
   * kompyuterdagi backendga uzatadi. Natijada CORS ham, mixed-content ham bo'lmaydi.
   */
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },

  // Telegram Mini App ichida ochilishi uchun kerakli sarlavhalar
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
      },
    ];
  },
};

export default nextConfig;
