/**
 * Do'kondagi BARCHA matnlar shu yerda.
 * Har bir kalit admin panelidagi "Matnlar" bo'limi orqali tahrirlanadi —
 * bu yerdagi qiymatlar faqat zaxira (baza bo'sh bo'lsa ishlatiladi).
 *
 * Ro'yxatli maydonlar formati: har bir qator — bitta element,
 * ustunlar "|" belgisi bilan ajratiladi.
 */

export const DEFAULT_SETTINGS: Record<string, string> = {
  // ---------- Umumiy ----------
  shop_name: 'Malohat pishiriqlari',
  welcome_text: 'Uy sharoitida, sevgi bilan pishirilgan shirinliklar',
  welcome_greeting: 'Xush kelibsiz',

  // ---------- Reklama bloki (Hero) ----------
  hero_badge: 'BUGUNGI TAKLIF',
  hero_title: 'Shirin lahzalarni\nbiz bilan boshlang',
  hero_text: 'Barcha tortlarga 25% gacha chegirma va bepul yetkazib berish.',
  hero_button: 'Yangi buyurtma berish',
  hero_button_secondary: 'Katalogni ko‘rish',

  // ---------- Ishonch ko'rsatkichlari (qiymat | izoh) ----------
  stats: [
    "5 000+ | Mamnun mijoz",
    "4.9 | O‘rtacha baho",
    "Tez | Yetkazib berish",
    "7 yil | Tajriba",
  ].join('\n'),

  // ---------- Afzalliklar (emoji | sarlavha | matn) ----------
  benefits_title: 'Nega aynan biz?',
  benefits: [
    "🌿 | 100% tabiiy mahsulotlar | Konservant va sun’iy bo‘yoqlarsiz",
    "👩‍🍳 | Buyurtmadan keyin pishiriladi | Har doim yangi va issiq",
    "🎁 | Bepul bezash va yozuv | Bayramingizni yanada chiroyli qilamiz",
    "🛡 | Sifat kafolati | Yoqmasa — pulingizni qaytaramiz",
  ].join('\n'),

  // ---------- Mijozlar sharhlari (ism | matn) ----------
  reviews_title: 'Mijozlarimiz aytadi',
  reviews: [
    "Nilufar | To‘yimizga tort buyurtma qildik — mehmonlar hayratda qoldi! Rahmat!",
    "Jasur | Napoleon shunchalik mazali ediki, ertasiga yana buyurtma berdim 😊",
    "Dilnoza | Vaqtida yetkazishdi, qadoqlash ham juda chiroyli edi.",
  ].join('\n'),

  // ---------- Pastki chaqiriq bloki ----------
  cta_title: 'Tayyormisiz?',
  cta_text: 'Bugun buyurtma bering — ertaga shirin kayfiyat sizniki.',
  cta_button: 'Katalogni ochish',

  // ---------- Mahsulot oynasidagi kafolat bloki (sarlavha | matn) ----------
  trust_badges: [
    "100% natijaga kafolat | Yoqmasa — pulingiz qaytariladi",
    "24/7 yordam markazi | Istalgan vaqtda javob beramiz",
    "Tez yetkazib berish | Buyurtmangizni eng qisqa muddatda yetkazamiz",
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

  // ---------- Order Bump (qo'shimcha savdo) ----------
  bump_badge: 'Maxsus taklif',
  bump_prefix: 'Bunga qo‘shimcha ravishda',
  bump_suffix: 'ga qo‘shasizmi?',

  // ---------- Bot matnlari ----------
  bot_bullets: [
    "✅ Faqat tabiiy mahsulotlar",
    "✅ Buyurtmadan keyin pishiriladi",
    "✅ Tez va ishonchli yetkazib berish",
  ].join('\n'),
  about_text: 'Biz 2018-yildan beri uy sharoitida tort va shirinliklar tayyorlaymiz.',
  about_bullets: [
    "5000+ mamnun mijoz",
    "100% tabiiy mahsulotlar, konservantsiz",
    "Buyurtma qabul qilingandan so‘ng pishiriladi",
    "Sifat kafolati va 24/7 yordam",
  ].join('\n'),
  contact_phone: '+998 90 123 45 67',
  contact_telegram: '@malohat_pishiriqlari',
  contact_hours: 'har kuni 09:00 – 21:00',
};

/** Sozlamadan qiymat olish (bo'sh bo'lsa — zaxira qiymat) */
export function pick(settings: Record<string, string>, key: string): string {
  const value = settings[key];
  return value !== undefined && value !== '' ? value : DEFAULT_SETTINGS[key] ?? '';
}

/**
 * Ko'p qatorli sozlamani ustunlarga ajratish.
 * "🌿 | Sarlavha | Matn" -> ['🌿', 'Sarlavha', 'Matn']
 */
export function parseRows(value: string): string[][] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((cell) => cell.trim()));
}
