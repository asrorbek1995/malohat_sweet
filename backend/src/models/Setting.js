/**
 * Setting modeli — do'kon matnlari va sozlamalari (key/value).
 */
const { prisma } = require('../database/connection');
const { DEFAULT_CONTENT } = require('../config/content');

const SettingModel = {
  /** Barcha matnlar — bazada yo'q kalitlar zaxira qiymat bilan to'ldiriladi */
  async all() {
    const rows = await prisma.setting.findMany();
    const stored = rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
    return { ...DEFAULT_CONTENT, ...stored };
  },

  /** Faqat bazada saqlangan qiymatlar (zaxirasiz) */
  async stored() {
    const rows = await prisma.setting.findMany();
    return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
  },

  /**
   * Yetishmayotgan matnlarni boshlang'ich qiymat bilan to'ldirish.
   * Mavjud yozuvlarga TEGILMAYDI — admin yozgan matnlar saqlanib qoladi.
   */
  async ensureDefaults() {
    const existing = new Set((await prisma.setting.findMany({ select: { key: true } })).map((r) => r.key));
    const missing = Object.keys(DEFAULT_CONTENT).filter((k) => !existing.has(k));

    if (missing.length) {
      await prisma.setting.createMany({
        data: missing.map((key) => ({ key, value: DEFAULT_CONTENT[key] })),
        skipDuplicates: true,
      });
    }
    return missing;
  },

  /** Bitta matnni boshlang'ich holatiga qaytarish */
  async reset(key) {
    if (DEFAULT_CONTENT[key] === undefined) throw new Error(`Noma'lum kalit: ${key}`);
    return this.set(key, DEFAULT_CONTENT[key]);
  },

  async get(key, fallback = null) {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row) return row.value;
    return DEFAULT_CONTENT[key] !== undefined ? DEFAULT_CONTENT[key] : fallback;
  },

  /** Ko'p qatorli matnni ustunlarga ajratish: "a | b | c" -> ['a','b','c'] */
  async rows(key) {
    const value = await this.get(key, '');
    return String(value)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split('|').map((cell) => cell.trim()));
  },

  async set(key, value) {
    return prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  },

  async setMany(obj) {
    const keys = Object.keys(obj || {});
    for (const key of keys) await this.set(key, obj[key]);
    return this.all();
  },
};

module.exports = SettingModel;
