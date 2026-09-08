/**
 * Savat va buyurtma logikasi.
 * Web App'dan kelgan ma'lumot shu yerda qayta ishlanadi va admin'ga yuboriladi.
 */
const OrderModel = require('../models/Order');
const ProductModel = require('../models/Product');
const UserModel = require('../models/User');
const keyboards = require('../utils/keyboards');
const logger = require('../utils/logger');
const config = require('../config/default');
const SettingModel = require('../models/Setting');
const { money } = require('./startController');

/**
 * Savat elementlarini bazadagi haqiqiy narxlar bo'yicha qayta hisoblash.
 * Mijoz tomonidan yuborilgan narxlarga ishonmaymiz (xavfsizlik).
 * @param {Array} rawItems [{ productId, quantity }]
 * @returns {{ items: Array, totalAmount: number }}
 */
async function buildOrderItems(rawItems) {
  const items = [];
  let totalAmount = 0;

  for (const raw of rawItems || []) {
    const productId = Number(raw.productId ?? raw.id);
    const quantity = Math.max(1, Number(raw.quantity || 1));
    if (!productId) continue;

    const product = await ProductModel.findById(productId);
    if (!product || !product.isActive) continue;

    const price = product.newPrice;
    totalAmount += price * quantity;

    items.push({
      productId: product.id,
      title: product.title,
      price,
      quantity,
      isBump: !!product.isOrderBump,
      imageUrl: product.imageUrl,
    });
  }

  return { items, totalAmount: Math.round(totalAmount) };
}

/** Adminga yuboriladigan buyurtma xabari matni */
function formatAdminMessage(order, from, currency) {
  const date = new Date(order.createdAt).toLocaleString('ru-RU');
  const lines = order.items.map(
    (i, idx) =>
      `${idx + 1}. ${i.isBump ? '🎁 ' : ''}<b>${i.title}</b>\n    ${i.quantity} × ${money(i.price, currency)} = <b>${money(i.price * i.quantity, currency)}</b>`
  );

  const username = from?.username ? `@${from.username}` : '—';

  return [
    '🔔 <b>YANGI BUYURTMA!</b>',
    `<b>Raqami:</b> #${order.id}`,
    `<b>Sana:</b> ${date}`,
    '',
    '👤 <b>Mijoz</b>',
    `Ism: <b>${order.customerName}</b>`,
    `Telefon: <b>${order.phone || '—'}</b>`,
    `Manzil: ${order.address || '—'}`,
    `Telegram: ${username} (ID: <code>${order.telegramId || '—'}</code>)`,
    order.comment ? `Izoh: <i>${order.comment}</i>` : null,
    '',
    '🛒 <b>Buyurtma tarkibi</b>',
    ...lines,
    '',
    `💰 <b>JAMI: ${money(order.totalAmount, currency)}</b>`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

const cartController = {
  buildOrderItems,
  formatAdminMessage,

  /**
   * Buyurtmani yaratish va adminga xabar yuborish.
   * Ham Web App'dan (bot orqali), ham REST API'dan chaqiriladi.
   * @param {Telegraf} bot
   * @param {object} payload { customerName, phone, address, comment, items, telegramId, username }
   */
  async createOrder(bot, payload) {
    const { items, totalAmount } = await buildOrderItems(payload.items);

    if (!items.length) {
      throw new Error('Savat bo‘sh yoki mahsulotlar topilmadi');
    }

    let user = null;
    if (payload.telegramId) {
      user = await UserModel.findByTelegramId(payload.telegramId);
    }

    const order = await OrderModel.create({
      customerName: payload.customerName || user?.name || 'Mijoz',
      phone: payload.phone || user?.phone || null,
      address: payload.address || null,
      comment: payload.comment || null,
      totalAmount,
      items,
      userId: user?.id || null,
      telegramId: payload.telegramId || null,
    });

    const currency = await SettingModel.get('currency');
    logger.success(`Yangi buyurtma #${order.id} — ${money(totalAmount, currency)}`);

    // ---- Adminga xabar ----
    try {
      await bot.telegram.sendMessage(
        config.admin.telegramId,
        formatAdminMessage(order, { username: payload.username }, currency),
        { parse_mode: 'HTML', ...keyboards.adminOrder(order.id) }
      );
    } catch (err) {
      logger.fail('Adminga xabar yuborishda xato', err);
    }

    // ---- Mijozga tasdiq ----
    if (payload.telegramId) {
      try {
        await bot.telegram.sendMessage(
          payload.telegramId,
          [
            '✅ <b>Buyurtmangiz qabul qilindi!</b>',
            '',
            `Buyurtma raqami: <b>#${order.id}</b>`,
            `Jami summa: <b>${money(order.totalAmount, currency)}</b>`,
            '',
            'Operatorimiz tez orada siz bilan bog‘lanadi. Rahmat! 🍰',
          ].join('\n'),
          { parse_mode: 'HTML', ...keyboards.afterOrder() }
        );
      } catch (err) {
        logger.warn('Mijozga xabar yuborilmadi:', err.message);
      }
    }

    return order;
  },

  /**
   * Telegram Web App'dan `sendData` orqali kelgan ma'lumotni qabul qilish.
   * Frontend JSON yuboradi: { type: 'order', customerName, phone, items: [...] }
   */
  async handleWebAppData(ctx) {
    const raw = ctx.message?.web_app_data?.data;
    if (!raw) return;

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (err) {
      logger.fail('Web App ma\'lumotini o\'qib bo\'lmadi', err);
      return ctx.reply('❌ Buyurtma ma\'lumotlarida xatolik. Qaytadan urinib ko\'ring.');
    }

    if (payload.type && payload.type !== 'order') return;

    try {
      // createOrder `bot.telegram` kutadi — ctx.telegram bilan mos obyekt beramiz
      await cartController.createOrder({ telegram: ctx.telegram }, {
        ...payload,
        telegramId: String(ctx.from.id),
        username: ctx.from.username,
      });
    } catch (err) {
      logger.fail('Buyurtma yaratishda xato', err);
      await ctx.reply('❌ Buyurtmani qabul qilib bo\'lmadi. Iltimos, qaytadan urinib ko\'ring.');
    }
  },

  /** Admin buyurtma holatini o'zgartirganda (inline tugmalar) */
  async changeStatus(ctx, orderId, status) {
    if (!ctx.state.isAdmin) return ctx.answerCbQuery('⛔️ Ruxsat yo‘q', { show_alert: true });

    try {
      const order = await OrderModel.updateStatus(orderId, status);
      const label = { CONFIRMED: '✅ Tasdiqlandi', DELIVERED: '🚚 Yetkazildi', CANCELLED: '❌ Bekor qilindi' }[status];

      await ctx.answerCbQuery(label);
      await ctx.editMessageReplyMarkup({ inline_keyboard: [[{ text: `${label} — #${order.id}`, callback_data: 'noop' }]] });

      // Mijozni xabardor qilamiz
      if (order.telegramId) {
        const clientText = {
          CONFIRMED: `✅ Buyurtmangiz <b>#${order.id}</b> tasdiqlandi! Tez orada tayyorlaymiz.`,
          DELIVERED: `🚚 Buyurtmangiz <b>#${order.id}</b> yetkazildi. Yoqimli ishtaha! 🍰`,
          CANCELLED: `❌ Buyurtmangiz <b>#${order.id}</b> bekor qilindi. Savollar bo‘lsa, biz bilan bog‘laning.`,
        }[status];

        try {
          await ctx.telegram.sendMessage(order.telegramId, clientText, { parse_mode: 'HTML' });
        } catch (err) {
          logger.warn('Mijozga status yuborilmadi:', err.message);
        }
      }
    } catch (err) {
      logger.fail('Statusni o\'zgartirishda xato', err);
      await ctx.answerCbQuery('Xatolik yuz berdi', { show_alert: true });
    }
  },
};

module.exports = cartController;
