/**
 * ============================================================
 *  Malohat pishiriqlari — asosiy ishga tushirish fayli
 *  1) Bazaga ulanadi va matnlarni tekshiradi
 *  2) REST API serverni ko'taradi
 *  3) Frontend uchun HTTPS tunnel ochadi (avtomatik)
 *  4) Telegram botni ishga tushiradi
 * ============================================================
 */
const config = require('./config/default');
const logger = require('./utils/logger');
const { connectDatabase, disconnectDatabase } = require('./database/connection');
const SettingModel = require('./models/Setting');
const { bot, launchBot } = require('./core/bot');
const { ensurePublicUrl, stopTunnel } = require('./core/tunnel');
const { startServer } = require('./api/server');

async function bootstrap() {
  logger.info('=========================================');
  logger.info(`  ${config.shop.name} — backend (${config.env})`);
  logger.info('=========================================');

  // 1) Baza
  await connectDatabase();
  const addedTexts = await SettingModel.ensureDefaults();
  if (addedTexts.length) logger.info(`${addedTexts.length} ta yangi matn qo‘shildi`);

  // 2) API
  const server = await startServer(bot);

  // 3) HTTPS manzil (kerak bo'lsa tunnel ochiladi)
  const { url, tunnelled } = await ensurePublicUrl();
  config.bot.webAppUrl = url;

  // 4) Bot
  await launchBot();

  if (tunnelled) {
    logger.info('');
    logger.success('Botga /start yuboring — “BOSHLASH” tugmasi shu manzilni ochadi:');
    logger.success(`  ${url}`);
    logger.info(`  Admin panel: ${url.replace(/\/$/, '')}/admin`);
    logger.info('');
  }

  // ---- Nafis to'xtatish ----
  const shutdown = async (signal) => {
    logger.warn(`${signal} qabul qilindi — to‘xtatilmoqda...`);
    try {
      bot.stop(signal);
      stopTunnel();
      server.close();
      await disconnectDatabase();
    } finally {
      process.exit(0);
    }
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.fail('Ishga tushirishda halokatli xato', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => logger.fail('Ushlanmagan Promise xatosi', err));
process.on('uncaughtException', (err) => logger.fail('Ushlanmagan istisno', err));
