/**
 * Bot ichidagi admin buyruqlari — statistika va hisobotlar.
 */
const OrderModel = require('../models/Order');
const UserModel = require('../models/User');
const ProductModel = require('../models/Product');
const keyboards = require('../utils/keyboards');
const { issueCode } = require('../core/adminCodes');
const logger = require('../utils/logger');
const config = require('../config/default');
const SettingModel = require('../models/Setting');
const { money } = require('./startController');

const adminController = {
  /**
   * /admin — panelga kirish uchun bir martalik 4 xonali kod yuboradi.
   * Kod faqat shu chatga keladi, shuning uchun uni faqat admin biladi.
   */
  async panel(ctx) {
    const [users, products, todayReport] = await Promise.all([
      UserModel.count(),
      ProductModel.count(),
      OrderModel.report(1),
    ]);

    const currency = await SettingModel.get('currency');
    const { code, expiresInMinutes } = issueCode(ctx.from.id);
    const adminUrl = `${config.bot.webAppUrl.replace(/\/$/, '')}/admin`;

    await ctx.replyWithHTML(
      [
        '👑 <b>Admin panel</b>',
        '',
        `👥 Foydalanuvchilar: <b>${users}</b>`,
        `🍰 Faol mahsulotlar: <b>${products}</b>`,
        `📦 Bugungi buyurtmalar: <b>${todayReport.totalOrders}</b>`,
        `💰 Bugungi tushum: <b>${money(todayReport.revenue, currency)}</b>`,
        '',
        '🔑 <b>Kirish kodi:</b>',
        `<code>${code}</code>`,
        '',
        `<i>Kod ${expiresInMinutes} daqiqa amal qiladi va bir marta ishlatiladi.</i>`,
        'Pastdagi tugmani bosing va shu kodni kiriting 👇',
      ].join('\n'),
      keyboards.adminPanel(adminUrl)
    );

    logger.info(`Admin kirish kodi yuborildi: ${ctx.from.id}`);
  },

  /** Yangi kod so'rash (inline tugma) */
  async newCode(ctx) {
    const { code, expiresInMinutes } = issueCode(ctx.from.id);
    await ctx.answerCbQuery('Yangi kod yuborildi');
    await ctx.replyWithHTML(
      [
        '🔑 <b>Yangi kirish kodi:</b>',
        `<code>${code}</code>`,
        '',
        `<i>${expiresInMinutes} daqiqa amal qiladi.</i>`,
      ].join('\n'),
      keyboards.adminPanel(`${config.bot.webAppUrl.replace(/\/$/, '')}/admin`)
    );
  },

  /** /hisobot yoki inline tugma — 7 / 30 kunlik hisobot */
  async report(ctx, days = 7) {
    try {
      const [r, currency] = await Promise.all([
        OrderModel.report(days),
        SettingModel.get('currency'),
      ]);

      const top = r.topProducts.length
        ? r.topProducts
            .slice(0, 5)
            .map((p, i) => `${i + 1}. ${p.title} — <b>${p.quantity} dona</b> (${money(p.revenue, currency)})`)
            .join('\n')
        : 'Ma’lumot yo‘q';

      const text = [
        `📊 <b>${days} kunlik hisobot</b>`,
        `<i>${new Date(r.from).toLocaleDateString('ru-RU')} — ${new Date().toLocaleDateString('ru-RU')}</i>`,
        '',
        `📦 Buyurtmalar: <b>${r.totalOrders}</b>`,
        `✅ Amaldagi: <b>${r.validOrders}</b>   ❌ Bekor: <b>${r.cancelledOrders}</b>`,
        `🍰 Sotilgan mahsulot: <b>${r.soldItems} dona</b>`,
        `💰 Tushum: <b>${money(r.revenue, currency)}</b>`,
        `🧾 O‘rtacha chek: <b>${money(r.averageCheck, currency)}</b>`,
        '',
        '<b>🏆 Eng ko‘p sotilganlar</b>',
        top,
      ].join('\n');

      if (ctx.callbackQuery) await ctx.answerCbQuery();
      await ctx.replyWithHTML(text, keyboards.adminReportPeriod());
    } catch (err) {
      logger.fail('Hisobot xatosi', err);
      await ctx.reply('❌ Hisobotni tayyorlashda xatolik yuz berdi.');
    }
  },

  /** Oxirgi buyurtmalar ro'yxati */
  async lastOrders(ctx) {
    const [orders, currency] = await Promise.all([
      OrderModel.list({ limit: 10 }),
      SettingModel.get('currency'),
    ]);
    if (!orders.length) return ctx.reply('Hozircha buyurtmalar yo‘q.');

    const lines = orders.map((o) => {
      const date = new Date(o.createdAt).toLocaleString('ru-RU');
      return `#${o.id} — ${o.customerName} — <b>${money(o.totalAmount, currency)}</b>\n<i>${date} · ${o.status}</i>`;
    });

    await ctx.replyWithHTML(`📦 <b>Oxirgi buyurtmalar</b>\n\n${lines.join('\n\n')}`);
  },
};

module.exports = adminController;
