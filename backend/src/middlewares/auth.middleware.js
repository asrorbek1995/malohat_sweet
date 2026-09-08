/**
 * Bot middleware — har bir xabarda foydalanuvchini bazadan tekshiradi/saqlaydi.
 * Natija ctx.state.user va ctx.state.isAdmin ichida keladi.
 */
const UserModel = require('../models/User');
const config = require('../config/default');
const logger = require('../utils/logger');

/** Foydalanuvchini bazadan olish yoki yaratish */
async function authMiddleware(ctx, next) {
  try {
    const tgUser = ctx.from;
    if (!tgUser) return next();

    const user = await UserModel.upsertFromTelegram(tgUser);
    ctx.state.user = user;
    ctx.state.isAdmin = user.role === 'ADMIN' || String(tgUser.id) === config.admin.telegramId;

    return next();
  } catch (err) {
    logger.fail('auth.middleware xatosi', err);
    // Baza ishlamasa ham bot javob bersin
    ctx.state.user = null;
    ctx.state.isAdmin = String(ctx.from?.id) === config.admin.telegramId;
    return next();
  }
}

/** Faqat admin uchun handlerlarni o'rash */
function adminOnly(handler) {
  return async (ctx, ...rest) => {
    if (!ctx.state.isAdmin) {
      return ctx.reply('⛔️ Bu bo‘lim faqat administrator uchun.');
    }
    return handler(ctx, ...rest);
  };
}

/** Har bir so'rovni loglash */
async function loggerMiddleware(ctx, next) {
  const started = Date.now();
  const text = ctx.message?.text || ctx.callbackQuery?.data || ctx.updateType;
  await next();
  logger.debug(`@${ctx.from?.username || ctx.from?.id} -> ${text} (${Date.now() - started}ms)`);
}

module.exports = { authMiddleware, adminOnly, loggerMiddleware };
