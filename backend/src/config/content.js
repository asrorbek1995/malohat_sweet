/**
 * Do'kondagi barcha matnlarning boshlang'ich qiymatlari.
 *
 * Bu qiymatlar faqat BIR MARTA — baza bo'sh bo'lganda yoziladi.
 * Keyinchalik admin panelidagi "Matnlar" bo'limi orqali tahrirlanadi
 * va seed qayta ishga tushirilsa ham admin yozgan matnlar o'chmaydi.
 *
 * Ro'yxatli maydonlar formati: har bir qator — bitta element,
 * ustunlar "|" belgisi bilan ajratiladi.
 */

const DEFAULT_CONTENT = {
  // ---------- Umumiy ----------
  shop_name: 'Malohat pishiriqlari',
  welcome_text: 'Uy sharoitida, sevgi bilan pishirilgan shirinliklar',
  welcome_greeting: 'Xush kelibsiz',
  currency: "so'm",

  // ---------- Reklama bloki (Hero) ----------
  hero_badge: 'BUGUNGI TAKLIF',
  hero_title: 'Shirin lahzalarni\nbiz bilan boshlang',
  hero_text: 'Barcha tortlarga 25% gacha chegirma va bepul yetkazib berish.',
  hero_button: 'Yangi buyurtma berish',
  hero_button_secondary: 'Katalogni ko‘rish',

  // ---------- Ishonch ko'rsatkichlari (qiymat | izoh) ----------
  stats: [
    '5 000+ | Mamnun mijoz',
    '4.9 | O‘rtacha baho',
    'Tez | Yetkazib berish',
    '7 yil | Tajriba',
  ].join('\n'),

  // ---------- Afzalliklar (emoji | sarlavha | matn) ----------
  benefits_title: 'Nega aynan biz?',
  benefits: [
    '🌿 | 100% tabiiy mahsulotlar | Konservant va sun’iy bo‘yoqlarsiz',
    '👩‍🍳 | Buyurtmadan keyin pishiriladi | Har doim yangi va issiq',
    '🎁 | Bepul bezash va yozuv | Bayramingizni yanada chiroyli qilamiz',
    '🛡 | Sifat kafolati | Yoqmasa — pulingizni qaytaramiz',
  ].join('\n'),

  // ---------- Mijozlar sharhlari (ism | matn) ----------
  reviews_title: 'Mijozlarimiz aytadi',
  reviews: [
    'Nilufar | To‘yimizga tort buyurtma qildik — mehmonlar hayratda qoldi! Rahmat!',
    'Jasur | Napoleon shunchalik mazali ediki, ertasiga yana buyurtma berdim 😊',
    'Dilnoza | Vaqtida yetkazishdi, qadoqlash ham juda chiroyli edi.',
  ].join('\n'),

  // ---------- Pastki chaqiriq bloki ----------
  cta_title: 'Tayyormisiz?',
  cta_text: 'Bugun buyurtma bering — ertaga shirin kayfiyat sizniki.',
  cta_button: 'Katalogni ochish',

  // ---------- Mahsulot oynasi ----------
  trust_badges: [
    '100% natijaga kafolat | Yoqmasa — pulingiz qaytariladi',
    '24/7 yordam markazi | Istalgan vaqtda javob beramiz',
    'Tez yetkazib berish | Buyurtmangizni eng qisqa muddatda yetkazamiz',
  ].join('\n'),
  ingredients_title: 'Tarkibi va foydasi',
  add_to_cart_button: 'Savatchaga qo‘shish',

  // ---------- Savatcha ----------
  cart_form_title: 'Yetkazib berish ma’lumotlari',
  cart_delivery_label: 'Yetkazib berish',
  cart_delivery_value: 'Bepul',
  cart_badge_left: 'Sifat kafolati',
  cart_badge_right: 'Tez yetkazamiz',
  cart_submit_button: 'Buyurtmani rasmiylashtirish',
  cart_submit_note: 'Tugmani bosish orqali buyurtmangiz operatorga yuboriladi',
  cart_empty_title: 'Savatchangiz bo‘sh',
  cart_empty_text: 'Katalogdan yoqqan shirinlikni tanlang — biz uni siz uchun tayyorlaymiz.',
  order_success_title: 'Buyurtmangiz qabul qilindi!',
  order_success_text: 'Operatorimiz tez orada siz bilan bog‘lanadi. Rahmat! 🍰',

  // ---------- Order Bump ----------
  bump_badge: 'Maxsus taklif',
  bump_prefix: 'Bunga qo‘shimcha ravishda',
  bump_suffix: 'ga qo‘shasizmi?',

  // ---------- Bot matnlari ----------
  bot_bullets: [
    '✅ Faqat tabiiy mahsulotlar',
    '✅ Buyurtmadan keyin pishiriladi',
    '✅ Tez va ishonchli yetkazib berish',
  ].join('\n'),
  bot_start_button: '🍰  BOSHLASH  🍰',
  about_text: 'Biz 2018-yildan beri uy sharoitida tort va shirinliklar tayyorlaymiz.',
  about_bullets: [
    '5000+ mamnun mijoz',
    '100% tabiiy mahsulotlar, konservantsiz',
    'Buyurtma qabul qilingandan so‘ng pishiriladi',
    'Sifat kafolati va 24/7 yordam',
  ].join('\n'),
  contact_phone: '+998 90 123 45 67',
  contact_telegram: '@malohat_pishiriqlari',
  contact_hours: 'har kuni 09:00 – 21:00',
};

/**
 * Admin panelida matnlarni guruhlab ko'rsatish uchun tavsif.
 * type: 'text' — bitta qator, 'area' — ko'p qatorli, 'rows' — ro'yxat.
 */
const CONTENT_GROUPS = [
  {
    title: 'Umumiy',
    fields: [
      { key: 'shop_name', label: 'Do‘kon nomi', type: 'text' },
      { key: 'welcome_text', label: 'Do‘kon shiori', type: 'text' },
      { key: 'welcome_greeting', label: 'Salomlashish so‘zi', type: 'text', hint: 'Masalan: "Xush kelibsiz, Ali!"' },
      { key: 'currency', label: 'Valyuta', type: 'text' },
    ],
  },
  {
    title: 'Reklama bloki (bosh sahifa)',
    fields: [
      { key: 'hero_badge', label: 'Kichik yorliq', type: 'text' },
      { key: 'hero_title', label: 'Katta sarlavha', type: 'area', hint: 'Yangi qator bilan ajrating' },
      { key: 'hero_text', label: 'Reklama matni', type: 'area' },
      { key: 'hero_button', label: 'Asosiy tugma', type: 'text' },
      { key: 'hero_button_secondary', label: 'Ikkinchi tugma', type: 'text' },
    ],
  },
  {
    title: 'Ishonch ko‘rsatkichlari',
    fields: [
      { key: 'stats', label: 'Ko‘rsatkichlar', type: 'rows', hint: 'Har qator: qiymat | izoh' },
    ],
  },
  {
    title: 'Afzalliklar',
    fields: [
      { key: 'benefits_title', label: 'Bo‘lim sarlavhasi', type: 'text' },
      { key: 'benefits', label: 'Afzalliklar', type: 'rows', hint: 'Har qator: emoji | sarlavha | matn' },
    ],
  },
  {
    title: 'Mijozlar sharhlari',
    fields: [
      { key: 'reviews_title', label: 'Bo‘lim sarlavhasi', type: 'text' },
      { key: 'reviews', label: 'Sharhlar', type: 'rows', hint: 'Har qator: ism | sharh matni' },
    ],
  },
  {
    title: 'Pastki chaqiriq bloki',
    fields: [
      { key: 'cta_title', label: 'Sarlavha', type: 'text' },
      { key: 'cta_text', label: 'Matn', type: 'area' },
      { key: 'cta_button', label: 'Tugma', type: 'text' },
    ],
  },
  {
    title: 'Mahsulot oynasi',
    fields: [
      { key: 'ingredients_title', label: 'Tarkib sarlavhasi', type: 'text' },
      { key: 'trust_badges', label: 'Kafolat bloklari', type: 'rows', hint: 'Har qator: sarlavha | matn' },
      { key: 'add_to_cart_button', label: 'Savatga qo‘shish tugmasi', type: 'text' },
    ],
  },
  {
    title: 'Savatcha',
    fields: [
      { key: 'cart_form_title', label: 'Forma sarlavhasi', type: 'text' },
      { key: 'cart_delivery_label', label: 'Yetkazish qatori', type: 'text' },
      { key: 'cart_delivery_value', label: 'Yetkazish narxi', type: 'text' },
      { key: 'cart_badge_left', label: 'Chap kafolat belgisi', type: 'text' },
      { key: 'cart_badge_right', label: 'O‘ng kafolat belgisi', type: 'text' },
      { key: 'cart_submit_button', label: 'Rasmiylashtirish tugmasi', type: 'text' },
      { key: 'cart_submit_note', label: 'Tugma ostidagi izoh', type: 'text' },
      { key: 'cart_empty_title', label: 'Bo‘sh savat sarlavhasi', type: 'text' },
      { key: 'cart_empty_text', label: 'Bo‘sh savat matni', type: 'area' },
      { key: 'order_success_title', label: 'Muvaffaqiyat sarlavhasi', type: 'text' },
      { key: 'order_success_text', label: 'Muvaffaqiyat matni', type: 'area' },
    ],
  },
  {
    title: 'Qo‘shimcha savdo (Order Bump)',
    fields: [
      { key: 'bump_badge', label: 'Yorliq', type: 'text' },
      { key: 'bump_prefix', label: 'Jumla boshi', type: 'text' },
      { key: 'bump_suffix', label: 'Jumla oxiri', type: 'text' },
    ],
  },
  {
    title: 'Bot matnlari',
    fields: [
      { key: 'bot_start_button', label: '“Boshlash” tugmasi', type: 'text' },
      { key: 'bot_bullets', label: '/start xabaridagi ro‘yxat', type: 'rows', hint: 'Har qator — bitta punkt' },
      { key: 'about_text', label: 'Biz haqimizda', type: 'area' },
      { key: 'about_bullets', label: 'Biz haqimizda ro‘yxati', type: 'rows' },
      { key: 'contact_phone', label: 'Telefon', type: 'text' },
      { key: 'contact_telegram', label: 'Telegram', type: 'text' },
      { key: 'contact_hours', label: 'Ish vaqti', type: 'text' },
    ],
  },
];

module.exports = { DEFAULT_CONTENT, CONTENT_GROUPS };
