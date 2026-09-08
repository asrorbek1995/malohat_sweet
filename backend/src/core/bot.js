/**
 * Telegraf bot instansiyasi va uni sozlash.
 */
const { Telegraf } = require('telegraf');
const config = require('../config/default');
const logger = require('../utils/logger');
const { authMiddleware, loggerMiddleware } = require('../middlewares/auth.middleware');
const registerRoutes = require('../routes/bot.routes');

const bot = new Telegraf(config.bot.token, { handlerTimeout: 30_000 });

// ---- Global middleware'lar ----
bot.use(loggerMiddleware);
bot.use(authMiddleware);

// ---- Handlerlarni ulash ----
registerRoutes(bot);

// ---- Global xatoliklar ----
bot.catch((err, ctx) => {
  logger.fail(`Bot xatosi (${ctx.updateType})`, err);
  try {
    ctx.reply('⚠️ Kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.');
  } catch (_) {
    /* javob berib bo'lmasa — e'tiborsiz qoldiramiz */
  }
});

/** Bot username'i — kirish sahifasidagi "Botni ochish" tugmasi uchun */
let botUsername = null;
const getBotUsername = () => botUsername;

/** Botni ishga tushirish (long polling) */
async function launchBot() {
  const me = await bot.telegram.getMe();
  botUsername = me.username;

  await bot.telegram.setMyCommands([
    { command: 'start', description: 'Do‘konni ochish' },
    { command: 'katalog', description: 'Mahsulotlar katalogi' },
    { command: 'buyurtmalarim', description: 'Buyurtmalarim' },
    { command: 'aloqa', description: 'Biz bilan bog‘lanish' },
    { command: 'help', description: 'Yordam' },
  ]);

  // Chat menyusidagi tugmani Web App'ga bog'laymiz
  try {
    await bot.telegram.setChatMenuButton({
      menuButton: { type: 'web_app', text: 'Do‘kon', web_app: { url: config.bot.webAppUrl } },
    });
  } catch (err) {
    logger.warn('Menu tugmasini o‘rnatib bo‘lmadi (URL HTTPS bo‘lishi kerak):', err.message);
  }

  bot.launch({ dropPendingUpdates: true });
  logger.success(`Bot ishga tushdi: @${me.username}`);
  logger.info(`Web App manzili: ${config.bot.webAppUrl}`);
  return bot;
}

module.exports = { bot, launchBot, getBotUsername };
