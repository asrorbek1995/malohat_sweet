/**
 * Telegram WebApp faqat HTTPS manzilni ochadi.
 * Bu modul frontend (localhost:3000) uchun avtomatik HTTPS tunnel ochadi,
 * shunda hech qanday qo'lda sozlash talab qilinmaydi.
 *
 * Ishlab chiqarishda .env dagi WEB_APP_URL real HTTPS domenga o'rnatilsa,
 * tunnel umuman ishga tushmaydi.
 */
const config = require('./../config/default');
const logger = require('../utils/logger');

/** Manzil tunnel talab qilmaydigan real HTTPS domenmi? */
function isPublicHttps(url) {
  if (!url || !url.startsWith('https://')) return false;
  return !/^https:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(url);
}

let active = null;

/**
 * HTTPS manzilni tayyorlaydi.
 * @returns {Promise<{ url: string, stop: () => void, tunnelled: boolean }>}
 */
async function ensurePublicUrl() {
  // 1) .env da tayyor HTTPS domen bo'lsa — o'shani ishlatamiz
  if (isPublicHttps(config.bot.webAppUrl)) {
    logger.info(`Web App manzili .env dan olindi: ${config.bot.webAppUrl}`);
    return { url: config.bot.webAppUrl, stop: () => {}, tunnelled: false };
  }

  if (!config.tunnel.enabled) {
    logger.warn('Tunnel o‘chirilgan (USE_TUNNEL=false). Telegram HTTPS manzilni talab qiladi!');
    return { url: config.bot.webAppUrl, stop: () => {}, tunnelled: false };
  }

  // 2) Aks holda avtomatik HTTPS tunnel ochamiz
  const target = `http://localhost:${config.tunnel.frontendPort}`;
  logger.info(`HTTPS tunnel ochilmoqda: ${target} …`);

  try {
    const { tunnel } = require('cloudflared');
    // Argumentlarni massiv ko'rinishida beramiz: obyekt shakli "tunnel run" ni yasaydi,
    // bizga esa nomlanmagan (quick) tunnel — "tunnel --url" kerak.
    const created = tunnel(['tunnel', '--url', target]);

    // Tunnel manzili `url` hodisasi orqali keladi
    const url = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('tunnel 60s ichida ochilmadi')), 60_000);

      created.once('url', (value) => {
        clearTimeout(timer);
        resolve(value);
      });
      created.once('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
      created.once('exit', (code) => {
        clearTimeout(timer);
        reject(new Error(`tunnel jarayoni to‘xtadi (kod ${code})`));
      });
    });

    active = created;
    logger.success(`HTTPS tunnel tayyor: ${url}`);

    return { url, tunnelled: true, stop: () => stopTunnel() };
  } catch (err) {
    logger.fail('Tunnel ochib bo‘lmadi', err);
    logger.warn(
      'Bot lokal manzil bilan ishlaydi — Telegram Web App ochilmasligi mumkin.\n' +
        '  Yechim: .env dagi WEB_APP_URL ni real HTTPS domenga o‘rnating.'
    );
    return { url: config.bot.webAppUrl, stop: () => {}, tunnelled: false };
  }
}

/** Ochiq tunnelni yopish */
function stopTunnel() {
  if (!active) return;
  try {
    active.stop();
  } catch (_) {
    /* allaqachon to'xtagan */
  }
  active = null;
}

module.exports = { ensurePublicUrl, stopTunnel, isPublicHttps };
