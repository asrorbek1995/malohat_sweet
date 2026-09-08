/**
 * User modeli — foydalanuvchi bilan bog'liq barcha baza so'rovlari.
 */
const { prisma } = require('../database/connection');
const config = require('../config/default');

const UserModel = {
  /** Telegram ID bo'yicha topish */
  async findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
  },

  /**
   * Foydalanuvchini saqlash yoki yangilash (/start bosilganda).
   * ADMIN_TELEGRAM_ID ga teng bo'lsa — avtomatik ADMIN roli beriladi.
   */
  async upsertFromTelegram(tgUser) {
    const telegramId = String(tgUser.id);
    const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Mehmon';
    const role = telegramId === config.admin.telegramId ? 'ADMIN' : undefined;

    return prisma.user.upsert({
      where: { telegramId },
      update: { name, username: tgUser.username || null, ...(role ? { role } : {}) },
      create: {
        telegramId,
        name,
        username: tgUser.username || null,
        role: role || 'USER',
      },
    });
  },

  /** Foydalanuvchi admin ekanligini tekshirish */
  async isAdmin(telegramId) {
    if (String(telegramId) === config.admin.telegramId) return true;
    const user = await this.findByTelegramId(telegramId);
    return !!user && user.role === 'ADMIN';
  },

  /** Telefon raqamini saqlash */
  async setPhone(telegramId, phone) {
    return prisma.user.update({ where: { telegramId: String(telegramId) }, data: { phone } });
  },

  /** Umumiy foydalanuvchilar soni (statistika uchun) */
  async count() {
    return prisma.user.count();
  },

  /** Berilgan sanadan keyin qo'shilganlar soni */
  async countSince(date) {
    return prisma.user.count({ where: { createdAt: { gte: date } } });
  },

  async all(limit = 100) {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  },
};

module.exports = UserModel;
