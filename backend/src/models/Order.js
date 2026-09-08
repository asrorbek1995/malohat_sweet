/**
 * Order modeli — buyurtmalar bilan ishlash va hisobotlar.
 */
const { prisma, toNumber } = require('../database/connection');

/**
 * Sanani MAHALLIY vaqt bo'yicha "YYYY-MM-DD" ko'rinishiga o'tkazish.
 * toISOString() UTC'ga o'tkazgani uchun kun siljib ketardi — shuning uchun qo'lda hisoblaymiz.
 */
function dayKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Prisma yozuvini JSON-ga tayyor ko'rinishga o'tkazish */
function serialize(order) {
  if (!order) return null;
  return {
    ...order,
    totalAmount: toNumber(order.totalAmount),
  };
}

const OrderModel = {
  /**
   * Yangi buyurtma yaratish.
   * @param {object} data { customerName, phone, address, comment, totalAmount, items, userId, telegramId }
   */
  async create(data) {
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        phone: data.phone || null,
        address: data.address || null,
        comment: data.comment || null,
        totalAmount: data.totalAmount,
        items: data.items,
        userId: data.userId || null,
        telegramId: data.telegramId ? String(data.telegramId) : null,
        status: 'NEW',
      },
    });
    return serialize(order);
  },

  async findById(id) {
    return serialize(await prisma.order.findUnique({ where: { id: Number(id) } }));
  },

  async list({ limit = 50, status } = {}) {
    const rows = await prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(serialize);
  },

  async updateStatus(id, status) {
    return serialize(await prisma.order.update({ where: { id: Number(id) }, data: { status } }));
  },

  /** Foydalanuvchining buyurtmalari */
  async listByTelegramId(telegramId, limit = 20) {
    const rows = await prisma.order.findMany({
      where: { telegramId: String(telegramId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(serialize);
  },

  /**
   * Hisobot: berilgan kun soni uchun statistika (7 yoki 30 kun).
   * Bekor qilingan buyurtmalar tushumga qo'shilmaydi.
   */
  async report(days = 7) {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (Number(days) - 1));

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: 'asc' },
    });

    const valid = orders.filter((o) => o.status !== 'CANCELLED');

    let revenue = 0;
    let soldItems = 0;
    const productStats = new Map();
    const byDay = new Map();

    // Kunlar bo'yicha bo'sh kataklarni oldindan to'ldiramiz
    for (let i = 0; i < Number(days); i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = dayKey(d);
      byDay.set(key, { date: key, orders: 0, revenue: 0 });
    }

    for (const o of valid) {
      const amount = toNumber(o.totalAmount);
      revenue += amount;

      const key = dayKey(o.createdAt);
      if (byDay.has(key)) {
        const cell = byDay.get(key);
        cell.orders += 1;
        cell.revenue += amount;
      }

      const items = Array.isArray(o.items) ? o.items : [];
      for (const it of items) {
        const qty = Number(it.quantity || 1);
        soldItems += qty;
        const prev = productStats.get(it.title) || { title: it.title, quantity: 0, revenue: 0 };
        prev.quantity += qty;
        prev.revenue += Number(it.price || 0) * qty;
        productStats.set(it.title, prev);
      }
    }

    const topProducts = [...productStats.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      days: Number(days),
      from: from.toISOString(),
      totalOrders: orders.length,
      validOrders: valid.length,
      cancelledOrders: orders.length - valid.length,
      revenue,
      soldItems,
      averageCheck: valid.length ? Math.round(revenue / valid.length) : 0,
      topProducts,
      chart: [...byDay.values()],
      statusBreakdown: {
        NEW: orders.filter((o) => o.status === 'NEW').length,
        CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
        DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
        CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
      },
    };
  },
};

module.exports = OrderModel;
