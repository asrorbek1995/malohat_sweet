/**
 * Upload modeli — yuklangan rasmlar BAZADA saqlanadi.
 *
 * Nega diskda emas? Render, Railway, Vercel kabi xostinglarda fayl tizimi
 * vaqtinchalik: har qayta deploy yoki qayta ishga tushirishda diskdagi
 * fayllar o'chib ketadi. Bazadagi rasmlar esa saqlanib qoladi.
 */
const crypto = require('crypto');
const path = require('path');
const { prisma } = require('../database/connection');

/** Fayl uchun takrorlanmas nom yasash */
function buildName(originalName, mimeType) {
  const extFromName = path.extname(originalName || '').toLowerCase();
  const extFromMime = '.' + (mimeType || 'image/jpeg').split('/')[1].replace('jpeg', 'jpg');
  const ext = /^\.[a-z0-9]{2,5}$/.test(extFromName) ? extFromName : extFromMime;
  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
}

const UploadModel = {
  /** Rasmni bazaga saqlash */
  async save({ buffer, originalName, mimeType }) {
    const name = buildName(originalName, mimeType);
    const row = await prisma.upload.create({
      data: { name, mimeType, size: buffer.length, data: buffer },
      select: { name: true, mimeType: true, size: true, createdAt: true },
    });
    return {
      name: row.name,
      url: `/api/uploads/${row.name}`,
      originalName: originalName || row.name,
      size: row.size,
      createdAt: row.createdAt.getTime(),
    };
  },

  /** Rasmni nomi bo'yicha olish (ko'rsatish uchun) */
  async findByName(name) {
    return prisma.upload.findUnique({ where: { name } });
  },

  /** Galereya ro'yxati — rasmning o'zi emas, faqat ma'lumotlari */
  async list(limit = 200) {
    const rows = await prisma.upload.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { name: true, size: true, mimeType: true, createdAt: true },
    });
    return rows.map((r) => ({
      name: r.name,
      url: `/api/uploads/${r.name}`,
      size: r.size,
      createdAt: r.createdAt.getTime(),
    }));
  },

  /** O'chirish */
  async remove(name) {
    await prisma.upload.delete({ where: { name } });
    return { name };
  },

  async count() {
    return prisma.upload.count();
  },
};

module.exports = UploadModel;
