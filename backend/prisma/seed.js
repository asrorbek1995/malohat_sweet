/**
 * Boshlang'ich ma'lumotlar — kategoriyalar, mahsulotlar, storislar, admin.
 * Ishga tushirish: npm run db:seed
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const SettingModel = require('../src/models/Setting');

const prisma = new PrismaClient();
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || '7536494282';

const IMG = {
  tort1: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  tort2: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
  tort3: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
  keks: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80',
  cupcake: 'https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=800&q=80',
  macaron: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800&q=80',
  cookie: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
  chak: 'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?w=800&q=80',
  eclair: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800&q=80',
  donut: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  story1: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80',
  story2: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&q=80',
  story3: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',
  story4: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80',
  banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80',
};

async function main() {
  console.log('Seed boshlandi...');

  // ---------- Admin foydalanuvchi ----------
  await prisma.user.upsert({
    where: { telegramId: ADMIN_TELEGRAM_ID },
    update: { role: 'ADMIN' },
    create: { telegramId: ADMIN_TELEGRAM_ID, name: 'Malohat Admin', role: 'ADMIN' },
  });

  // ---------- Kategoriyalar ----------
  const categories = [
    { name: 'Tortlar', emoji: '🎂', sortOrder: 1 },
    { name: 'Keksiklar', emoji: '🧁', sortOrder: 2 },
    { name: 'Pirojniylar', emoji: '🍰', sortOrder: 3 },
    { name: 'Pechenyelar', emoji: '🍪', sortOrder: 4 },
    { name: 'Premium', emoji: '👑', sortOrder: 5 },
  ];
  const catMap = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { name: c.name },
      update: { emoji: c.emoji, sortOrder: c.sortOrder },
      create: c,
    });
    catMap[c.name] = row.id;
  }

  // ---------- Mahsulotlar ----------
  const products = [
    {
      title: 'Napoleon tort (1.5 kg)',
      description: 'Klassik uy sharoitida pishirilgan Napoleon. Yupqa qatlamlar va nozik krem.',
      ingredients: [
        '18 qatlam qo‘lda yoyilgan xamir',
        'Tabiiy sut kremi, konservantsiz',
        'Yangi tuxum va sariyog‘',
        'Buyurtmadan keyin pishiriladi',
      ],
      oldPrice: 260000,
      newPrice: 195000,
      imageUrl: IMG.tort1,
      categoryId: catMap['Tortlar'],
      isBestSeller: true,
      sortOrder: 1,
    },
    {
      title: 'Shokoladli Medovik (1.2 kg)',
      description: 'Asal qatlamlari va Belgiya shokoladi uyg‘unligi.',
      ingredients: [
        'Tabiiy asal asosidagi qatlamlar',
        'Belgiya qora shokoladi 54%',
        'Smetana kremi',
        'Sovutgichda 3 kun saqlanadi',
      ],
      oldPrice: 240000,
      newPrice: 180000,
      imageUrl: IMG.tort2,
      categoryId: catMap['Tortlar'],
      isBestSeller: true,
      sortOrder: 2,
    },
    {
      title: 'Red Velvet Premium (2 kg)',
      description: 'Bayramlar uchun maxsus — qizil baxmal va krem-chiz.',
      ingredients: [
        'Tabiiy qizil bo‘yoq (lavlagi ekstrakti)',
        'Philadelphia krem-chiz',
        'Bezak: yangi mevalar va oltin varaq',
        'Bepul bayram yozuvi',
      ],
      oldPrice: 520000,
      newPrice: 420000,
      imageUrl: IMG.tort3,
      categoryId: catMap['Premium'],
      sortOrder: 3,
    },
    {
      title: 'Limonli keks (500 g)',
      description: 'Yumshoq, xushbo‘y limon keksi — choyga eng zo‘r hamroh.',
      ingredients: ['Yangi limon sharbati va po‘sti', 'Sariyog‘li xamir', 'Shakar glazur'],
      oldPrice: 75000,
      newPrice: 55000,
      imageUrl: IMG.keks,
      categoryId: catMap['Keksiklar'],
      sortOrder: 4,
    },
    {
      title: 'Kapkeyk to‘plami (6 dona)',
      description: 'Rang-barang kremli kapkeyklar — bolalar bayrami uchun ideal.',
      ingredients: ['6 xil ta’m', 'Tabiiy bo‘yoqlar', 'Sovg‘a qutisi bilan'],
      oldPrice: 130000,
      newPrice: 99000,
      imageUrl: IMG.cupcake,
      categoryId: catMap['Keksiklar'],
      isBestSeller: true,
      sortOrder: 5,
    },
    {
      title: 'Makaron assorti (12 dona)',
      description: 'Fransuz makaronlari — 6 xil ta’mda, qo‘lda tayyorlangan.',
      ingredients: ['Bodom uni asosida', 'Ganash to‘ldirmasi', 'Sovg‘abop quti', 'Glyutensiz'],
      oldPrice: 180000,
      newPrice: 145000,
      imageUrl: IMG.macaron,
      categoryId: catMap['Premium'],
      isBestSeller: true,
      sortOrder: 6,
    },
    {
      title: 'Shokoladli pechenye (700 g)',
      description: 'Ichi yumshoq, tashqarisi xrustik amerikacha kuki.',
      ingredients: ['Belgiya shokolad bo‘lakchalari', 'Dengiz tuzi', 'Sariyog‘ 100%'],
      oldPrice: 85000,
      newPrice: 65000,
      imageUrl: IMG.cookie,
      categoryId: catMap['Pechenyelar'],
      sortOrder: 7,
    },
    {
      title: 'Chak-chak (1 kg)',
      description: 'Milliy shirinlik — tabiiy asalda, o‘zimizning retsept bo‘yicha.',
      ingredients: ['100% tabiiy asal', 'Yangi tuxum xamiri', 'Yong‘oq bilan bezatilgan'],
      oldPrice: 110000,
      newPrice: 89000,
      imageUrl: IMG.chak,
      categoryId: catMap['Pirojniylar'],
      sortOrder: 8,
    },
    {
      title: 'Ekler assorti (10 dona)',
      description: 'Nozik zavarnoy xamir va uch xil krem.',
      ingredients: ['Vanil, shokolad va karamel kremi', 'Har kuni yangi pishiriladi'],
      oldPrice: 120000,
      newPrice: 95000,
      imageUrl: IMG.eclair,
      categoryId: catMap['Pirojniylar'],
      sortOrder: 9,
    },
    // ---- Order Bump mahsulot (savatchada qo'shimcha savdo) ----
    {
      title: 'Bonus: Mini donut to‘plami (4 dona)',
      description: 'Buyurtmangizga arzon narxda qo‘shiladigan shirin bonus.',
      ingredients: ['4 dona mini donut', 'Shokolad va rangli sepma', 'Faqat buyurtma bilan birga'],
      oldPrice: 60000,
      newPrice: 25000,
      imageUrl: IMG.donut,
      categoryId: catMap['Keksiklar'],
      isOrderBump: true,
      sortOrder: 99,
    },
  ];

  await prisma.product.deleteMany({});
  for (const p of products) await prisma.product.create({ data: p });

  // ---------- Storislar / Bannerlar ----------
  await prisma.story.deleteMany({});
  await prisma.story.createMany({
    data: [
      { title: '-25% chegirma', subtitle: 'Faqat shu hafta', imageUrl: IMG.story1, type: 'STORY', sortOrder: 1 },
      { title: 'Mijozlar sharhi', subtitle: '"Juda mazali edi!"', imageUrl: IMG.story2, type: 'STORY', sortOrder: 2 },
      { title: 'To‘y kunimiz', subtitle: '300+ mehmon uchun', imageUrl: IMG.story3, type: 'STORY', sortOrder: 3 },
      { title: 'Yangi ta’mlar', subtitle: 'Sentabr yangiliklari', imageUrl: IMG.story4, type: 'STORY', sortOrder: 4 },
      { title: 'Bugun buyurtma bering', subtitle: 'Yetkazib berish bepul', imageUrl: IMG.banner, type: 'BANNER', sortOrder: 1 },
    ],
  });

  // ---------- Matnlar (sozlamalar) ----------
  // Faqat YETISHMAYOTGAN kalitlar qo'shiladi — admin tahrirlagan matnlar o'chmaydi
  const added = await SettingModel.ensureDefaults();

  console.log('Seed tugadi:', {
    kategoriya: Object.keys(catMap).length,
    mahsulot: products.length,
    story: 5,
    yangiMatnlar: added.length,
  });
}

main()
  .catch((e) => {
    console.error('Seed xatosi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
