/**
 * Bot handlerlarini controllerlarga ulash.
 */
const { message } = require('telegraf/filters');
const { startController } = require('../controllers/startController');
const cartController = require('../controllers/cartController');
const adminController = require('../controllers/adminController');
const { adminOnly } = require('../middlewares/auth.middleware');
const keyboards = require('../utils/keyboards');

/**
 * @param {import('telegraf').Telegraf} bot
 */
function registerRoutes(bot) {
  // ---------- Buyruqlar ----------
  bot.start((ctx) => startController.start(ctx));
  bot.help((ctx) => startController.help(ctx));
  bot.command('katalog', (ctx) =>
    ctx.reply('🍰 Katalogni ochish uchun tugmani bosing:', keyboards.webAppOnly())
  );
  bot.command('buyurtmalarim', (ctx) => startController.myOrders(ctx));
  bot.command('aloqa', (ctx) => startController.contact(ctx));

  // ---------- Admin buyruqlari ----------
  bot.command('admin', adminOnly((ctx) => adminController.panel(ctx)));
  bot.command('hisobot', adminOnly((ctx) => adminController.report(ctx, 7)));
  bot.command('buyurtmalar', adminOnly((ctx) => adminController.lastOrders(ctx)));

  // ---------- Inline tugmalar (callback) ----------
  bot.action('about', (ctx) => startController.about(ctx));
  bot.action('contact', (ctx) => startController.contact(ctx));
  bot.action('my_orders', (ctx) => startController.myOrders(ctx));
  bot.action('noop', (ctx) => ctx.answerCbQuery());

  bot.action('admin_new_code', adminOnly((ctx) => adminController.newCode(ctx)));
  bot.action('report_7', adminOnly((ctx) => adminController.report(ctx, 7)));
  bot.action('report_30', adminOnly((ctx) => adminController.report(ctx, 30)));

  bot.action(/^order_confirm_(\d+)$/, (ctx) =>
    cartController.changeStatus(ctx, ctx.match[1], 'CONFIRMED')
  );
  bot.action(/^order_delivered_(\d+)$/, (ctx) =>
    cartController.changeStatus(ctx, ctx.match[1], 'DELIVERED')
  );
  bot.action(/^order_cancel_(\d+)$/, (ctx) =>
    cartController.changeStatus(ctx, ctx.match[1], 'CANCELLED')
  );

  // ---------- Web App'dan kelgan buyurtma ----------
  bot.on(message('web_app_data'), (ctx) => cartController.handleWebAppData(ctx));

  // ---------- Kontakt ----------
  bot.on(message('contact'), (ctx) => startController.saveContact(ctx));

  // ---------- Reply klaviatura tugmalari ----------
  bot.hears('📞 Aloqa', (ctx) => startController.contact(ctx));
  bot.hears('🧾 Buyurtmalarim', (ctx) => startController.myOrders(ctx));

  // ---------- Boshqa matnlar ----------
  bot.on(message('text'), (ctx) =>
    ctx.reply(
      'Buyurtma berish uchun do‘konni oching 👇\n(Yordam uchun /help)',
      keyboards.webAppOnly()
    )
  );
}

module.exports = registerRoutes;
