/**
 * Inline tugmalar va WebApp tugmasi.
 * Barcha matnlar o'zbek tilida.
 */
const { Markup } = require('telegraf');
const config = require('../config/default');

const keyboards = {
  /** Katta "Boshla" tugmasi — Next.js Web App'ni ochadi (matni admin tomonidan tahrirlanadi) */
  start(label = '🍰  BOSHLASH  🍰') {
    return Markup.inlineKeyboard([
      [Markup.button.webApp(label, config.bot.webAppUrl)],
      [
        Markup.button.callback('📖 Biz haqimizda', 'about'),
        Markup.button.callback('📞 Aloqa', 'contact'),
      ],
      [Markup.button.callback('🧾 Mening buyurtmalarim', 'my_orders')],
    ]);
  },

  /** Faqat Web App tugmasi (qisqa xabarlarda) */
  webAppOnly(text = '🛒 Katalogni ochish') {
    return Markup.inlineKeyboard([[Markup.button.webApp(text, config.bot.webAppUrl)]]);
  },

  /** Doimiy (reply) klaviatura — pastda turadigan tugmalar */
  mainMenu() {
    return Markup.keyboard([
      [Markup.button.webApp('🍰 Do‘konni ochish', config.bot.webAppUrl)],
      ['📞 Aloqa', '🧾 Buyurtmalarim'],
    ]).resize();
  },

  /** Telefon raqamini so'rash */
  requestPhone() {
    return Markup.keyboard([[Markup.button.contactRequest('📱 Raqamni yuborish')]])
      .resize()
      .oneTime();
  },

  /** Adminga yuboriladigan buyurtma ostidagi boshqaruv tugmalari */
  adminOrder(orderId) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Tasdiqlash', `order_confirm_${orderId}`),
        Markup.button.callback('🚚 Yetkazildi', `order_delivered_${orderId}`),
      ],
      [Markup.button.callback('❌ Bekor qilish', `order_cancel_${orderId}`)],
    ]);
  },

  /** Admin panelni ochish + yangi kod so'rash */
  adminPanel(adminUrl) {
    return Markup.inlineKeyboard([
      [Markup.button.webApp('👑 Admin panelni ochish', adminUrl)],
      [
        Markup.button.callback('🔄 Yangi kod', 'admin_new_code'),
        Markup.button.callback('📊 Hisobot', 'report_7'),
      ],
    ]);
  },

  /** Admin uchun hisobot davri tanlash */
  adminReportPeriod() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 7 kunlik', 'report_7'),
        Markup.button.callback('📈 30 kunlik', 'report_30'),
      ],
    ]);
  },

  /** Mijozga buyurtma qabul qilingani haqidagi xabar ostida */
  afterOrder() {
    return Markup.inlineKeyboard([
      [Markup.button.webApp('🛍 Yana buyurtma berish', config.bot.webAppUrl)],
    ]);
  },
};

module.exports = keyboards;
