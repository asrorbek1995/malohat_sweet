/**
 * /start va umumiy bot handlerlari.
 * Barcha matnlar admin panelidagi "Matnlar" bo'limidan olinadi.
 */
const keyboards = require('../utils/keyboards');
const OrderModel = require('../models/Order');
const UserModel = require('../models/User');
const SettingModel = require('../models/Setting');
const logger = require('../utils/logger');
const config = require('../config/default');

/** Narxni chiroyli formatlash: 195000 -> "195 000 so'm" */
function money(value, currency) {
  const unit = currency || config.shop.currency;
  return `${Number(value).toLocaleString('ru-RU').replace(/ /g, ' ')} ${unit}`;
}

const startController = {
  /** /start — foydalanuvchini saqlaydi va katta "BOSHLASH" tugmasini yuboradi */
  async start(ctx) {
    const user = ctx.state.user;
    const name = user?.name || ctx.from?.first_name || 'mehmon';

    const [shopName, welcomeText, bullets, startButton] = await Promise.all([
      SettingModel.get('shop_name'),
      SettingModel.get('welcome_text'),
      SettingModel.rows('bot_bullets'),
      SettingModel.get('bot_start_button'),
    ]);

    const text = [
      `🍰 <b>Assalomu alaykum, ${name}!</b>`,
      '',
      `<b>${shopName}</b> — ${welcomeText}`,
      '',
      ...bullets.map((row) => row[0]),
      '',
      `Katalogni ochish uchun pastdagi <b>“${startButton.replace(/\s+/g, ' ').trim()}”</b> tugmasini bosing 👇`,
    ].join('\n');

    await ctx.replyWithHTML(text, keyboards.start(startButton));
    await ctx.reply('Quyidagi menyudan ham foydalanishingiz mumkin:', keyboards.mainMenu());

    logger.info(`Yangi /start: ${name} (${ctx.from.id})`);
  },

  /** /help */
  async help(ctx) {
    await ctx.replyWithHTML(
      [
        '<b>ℹ️ Yordam</b>',
        '',
        '/start — do‘konni ochish',
        '/katalog — mahsulotlar katalogi',
        '/buyurtmalarim — buyurtmalarim tarixi',
        '/aloqa — biz bilan bog‘lanish',
        '',
        ctx.state.isAdmin ? '<b>Admin:</b> /admin, /hisobot' : '',
      ]
        .filter(Boolean)
        .join('\n'),
      keyboards.webAppOnly()
    );
  },

  /** Biz haqimizda */
  async about(ctx) {
    const [shopName, aboutText, aboutBullets] = await Promise.all([
      SettingModel.get('shop_name'),
      SettingModel.get('about_text'),
      SettingModel.rows('about_bullets'),
    ]);

    const text = [
      `🎂 <b>${shopName}</b>`,
      '',
      aboutText,
      '',
      ...aboutBullets.map((row) => `• ${row[0]}`),
    ].join('\n');

    if (ctx.callbackQuery) await ctx.answerCbQuery();
    await ctx.replyWithHTML(text, keyboards.webAppOnly());
  },

  /** Aloqa */
  async contact(ctx) {
    const [phone, telegram, hours] = await Promise.all([
      SettingModel.get('contact_phone'),
      SettingModel.get('contact_telegram'),
      SettingModel.get('contact_hours'),
    ]);

    if (ctx.callbackQuery) await ctx.answerCbQuery();
    await ctx.replyWithHTML(
      [
        '📞 <b>Biz bilan bog‘lanish</b>',
        '',
        `Telefon: ${phone}`,
        `Telegram: ${telegram}`,
        `Ish vaqti: ${hours}`,
        '',
        'Savolingiz bo‘lsa, shu yerga yozing — tez orada javob beramiz.',
      ].join('\n')
    );
  },

  /** Foydalanuvchining buyurtmalari */
  async myOrders(ctx) {
    if (ctx.callbackQuery) await ctx.answerCbQuery();

    const orders = await OrderModel.listByTelegramId(ctx.from.id, 10);
    if (!orders.length) {
      return ctx.replyWithHTML(
        'Sizda hali buyurtma yo‘q 🙂\nBirinchi buyurtmangizni berib ko‘ring!',
        keyboards.webAppOnly()
      );
    }

    const currency = await SettingModel.get('currency');
    const statusText = {
      NEW: '🆕 Yangi',
      CONFIRMED: '✅ Tasdiqlangan',
      DELIVERED: '🚚 Yetkazilgan',
      CANCELLED: '❌ Bekor qilingan',
    };

    const lines = orders.map((o) => {
      const date = new Date(o.createdAt).toLocaleDateString('ru-RU');
      const items = (Array.isArray(o.items) ? o.items : [])
        .map((i) => `   • ${i.title} × ${i.quantity}`)
        .join('\n');
      return `<b>#${o.id}</b> — ${date} — ${statusText[o.status] || o.status}\n${items}\n   <b>Jami: ${money(o.totalAmount, currency)}</b>`;
    });

    await ctx.replyWithHTML(`🧾 <b>Buyurtmalaringiz</b>\n\n${lines.join('\n\n')}`);
  },

  /** Telefon raqami yuborilganda */
  async saveContact(ctx) {
    const phone = ctx.message?.contact?.phone_number;
    if (!phone) return;
    try {
      await UserModel.setPhone(ctx.from.id, phone);
      await ctx.reply('Rahmat! Raqamingiz saqlandi ✅', keyboards.mainMenu());
    } catch (err) {
      logger.fail('Telefonni saqlashda xato', err);
    }
  },
};

module.exports = { startController, money };
