/**
 * Admin panelga kirish uchun bir martalik 4 xonali kodlar.
 *
 * Ish tartibi:
 *   1. Admin botga /admin buyrug'ini yuboradi
 *   2. Bot unga 4 xonali kod yuboradi (5 daqiqa amal qiladi)
 *   3. Admin bu kodni /admin sahifasiga kiritadi
 *
 * Kod faqat ADMIN_TELEGRAM_ID egasining shaxsiy chatiga boradi,
 * shuning uchun uni faqat admin bila oladi.
 */
const crypto = require('crypto');
const config = require('../config/default');
const logger = require('../utils/logger');

/** Kod amal qilish muddati (millisekund) */
const TTL_MS = 5 * 60 * 1000;
/** Bitta kod uchun ruxsat etilgan noto'g'ri urinishlar */
const MAX_ATTEMPTS = 5;
/** Ketma-ket noto'g'ri urinishlardan keyin bloklash */
const LOCK_AFTER = 10;
const LOCK_MS = 10 * 60 * 1000;

/** telegramId -> { code, expiresAt, attempts } */
const codes = new Map();
/** Umumiy noto'g'ri urinishlar hisobi (brute-force'ga qarshi) */
let failures = 0;
let lockedUntil = 0;

/** Muddati o'tgan kodlarni tozalash */
function sweep() {
  const now = Date.now();
  for (const [key, entry] of codes) {
    if (entry.expiresAt <= now) codes.delete(key);
  }
}

/** Kriptografik xavfsiz 4 xonali kod */
function generateCode() {
  return String(crypto.randomInt(1000, 10000));
}

/**
 * Admin uchun yangi kod yaratish (eskisi bekor qilinadi).
 * @returns {{ code: string, expiresInMinutes: number }}
 */
function issueCode(telegramId) {
  sweep();
  const code = generateCode();
  codes.set(String(telegramId), {
    code,
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
  });
  logger.info(`Admin uchun yangi kirish kodi yaratildi (${telegramId})`);
  return { code, expiresInMinutes: TTL_MS / 60000 };
}

/**
 * Kodni tekshirish. To'g'ri bo'lsa kod darhol bekor qilinadi (bir martalik).
 * @returns {{ ok: boolean, error?: string, telegramId?: string }}
 */
function verifyCode(input) {
  sweep();

  const now = Date.now();
  if (now < lockedUntil) {
    const left = Math.ceil((lockedUntil - now) / 60000);
    return { ok: false, error: `Juda ko'p urinish. ${left} daqiqadan so'ng qayta urinib ko'ring.` };
  }

  const value = String(input || '').trim();
  if (!/^\d{4}$/.test(value)) {
    return { ok: false, error: 'Kod 4 ta raqamdan iborat bo‘lishi kerak' };
  }

  const adminId = String(config.admin.telegramId);
  const entry = codes.get(adminId);

  if (!entry) {
    return { ok: false, error: 'Kod topilmadi. Botga /admin yuborib yangi kod oling.' };
  }

  if (entry.code !== value) {
    entry.attempts += 1;
    failures += 1;

    if (failures >= LOCK_AFTER) {
      lockedUntil = now + LOCK_MS;
      failures = 0;
      codes.delete(adminId);
      logger.warn('Admin panelga kirish vaqtincha bloklandi (ko‘p noto‘g‘ri urinish)');
      return { ok: false, error: 'Juda ko‘p noto‘g‘ri urinish. 10 daqiqadan so‘ng urinib ko‘ring.' };
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
      codes.delete(adminId);
      return { ok: false, error: 'Kod bekor qilindi. Botga /admin yuborib yangi kod oling.' };
    }

    return {
      ok: false,
      error: `Kod noto‘g‘ri. Qolgan urinishlar: ${MAX_ATTEMPTS - entry.attempts}`,
    };
  }

  // To'g'ri — kod bir martalik, darhol o'chiriladi
  codes.delete(adminId);
  failures = 0;
  logger.success('Admin panelga muvaffaqiyatli kirildi (bot kodi orqali)');
  return { ok: true, telegramId: adminId };
}

/** Hozirda faol kod bormi (bot xabari uchun) */
function hasActiveCode(telegramId) {
  sweep();
  return codes.has(String(telegramId));
}

module.exports = { issueCode, verifyCode, hasActiveCode, TTL_MS };
