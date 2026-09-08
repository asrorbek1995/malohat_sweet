/**
 * PostgreSQL (Neon) ulanishi — Prisma Client singleton.
 * Butun loyihada faqat shu yerdagi `prisma` obyekti ishlatiladi.
 */
const { PrismaClient } = require('@prisma/client');
const config = require('../config/default');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  datasources: { db: { url: config.db.url } },
  log: config.isProd ? ['error'] : ['error', 'warn'],
});

/** Ulanishni tekshirish — server ishga tushganda chaqiriladi */
async function connectDatabase() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.success('PostgreSQL bazasiga ulanish muvaffaqiyatli (Neon)');
    return prisma;
  } catch (err) {
    logger.fail('Bazaga ulanib bo\'lmadi', err);
    throw err;
  }
}

/** Ulanishni yopish — process to'xtaganda */
async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Baza ulanishi yopildi');
}

/** Decimal -> number, JSON'ga uzatish uchun */
function toNumber(value) {
  if (value === null || value === undefined) return null;
  return typeof value === 'object' && typeof value.toNumber === 'function'
    ? value.toNumber()
    : Number(value);
}

module.exports = { prisma, connectDatabase, disconnectDatabase, toNumber };
