/**
 * Loyiha sozlamalari — barcha .env o'zgaruvchilari shu yerdan o'qiladi.
 * Boshqa fayllar process.env ga to'g'ridan-to'g'ri murojaat qilmasligi kerak.
 */
require('dotenv').config();

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`.env faylida "${key}" o'zgaruvchisi topilmadi!`);
  }
  return value;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',

  bot: {
    token: required('BOT_TOKEN'),
    // Telegram WebApp tugmasi ochadigan Next.js manzili (HTTPS bo'lishi shart).
    // Bo'sh yoki localhost bo'lsa — ishga tushganda avtomatik HTTPS tunnel ochiladi.
    webAppUrl: process.env.WEB_APP_URL || '',
  },

  tunnel: {
    // Avtomatik HTTPS tunnel (cloudflared). Real domen bo'lsa o'chiring: USE_TUNNEL=false
    enabled: String(process.env.USE_TUNNEL || 'true') !== 'false',
    frontendPort: Number(process.env.FRONTEND_PORT || 3000),
  },

  db: {
    url: required('DATABASE_URL'),
  },

  admin: {
    // Panelga faqat shu Telegram ID egasi kira oladi (kod shu chatga yuboriladi)
    telegramId: String(process.env.ADMIN_TELEGRAM_ID || '7536494282'),
  },

  api: {
    port: Number(process.env.PORT || 4000),
    jwtSecret: process.env.JWT_SECRET || 'malohat_dev_secret',
    // CORS uchun ruxsat etilgan manbalar (bo'sh bo'lsa — barchasi)
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
  },

  shop: {
    name: 'Malohat pishiriqlari',
    currency: "so'm",
  },
};

module.exports = config;
