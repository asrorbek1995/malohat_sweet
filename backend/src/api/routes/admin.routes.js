/**
 * Admin API — mahsulot/kategoriya/banner boshqaruvi va hisobotlar.
 * Barcha endpointlar (login'dan tashqari) JWT bilan himoyalangan.
 */
const { Router } = require('express');
const ProductModel = require('../../models/Product');
const CategoryModel = require('../../models/Category');
const StoryModel = require('../../models/Story');
const OrderModel = require('../../models/Order');
const UserModel = require('../../models/User');
const SettingModel = require('../../models/Setting');
const { CONTENT_GROUPS, DEFAULT_CONTENT } = require('../../config/content');
const { issueToken, requireAdmin } = require('../../middlewares/adminAuth.middleware');
const { verifyCode } = require('../../core/adminCodes');
const { getBotUsername } = require('../../core/bot');
const logger = require('../../utils/logger');

const router = Router();

// ================= KIRISH =================
/**
 * Kirish faqat bot yuborgan 4 xonali kod orqali.
 * Kodni olish: Telegram botda /admin buyrug'i.
 */
router.post('/login', (req, res) => {
  const { code } = req.body || {};
  const result = verifyCode(code);

  if (!result.ok) {
    return res.status(401).json({ ok: false, error: result.error });
  }

  res.json({ ok: true, token: issueToken(result.telegramId) });
});

/** Kirish sahifasi uchun bot manzili (tugma qilib ko'rsatiladi) */
router.get('/bot-link', async (req, res) => {
  try {
    const me = getBotUsername();
    res.json({ ok: true, data: { username: me, url: me ? `https://t.me/${me}` : null } });
  } catch {
    res.json({ ok: true, data: { username: null, url: null } });
  }
});

// Shu joydan keyingi barcha yo'llar himoyalangan
router.use(requireAdmin);

router.get('/me', (req, res) => res.json({ ok: true, data: req.admin }));

// ================= MAHSULOTLAR =================
router.get('/products', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await ProductModel.list({ includeInactive: true }) });
  } catch (e) { next(e); }
});

router.post('/products', async (req, res, next) => {
  try {
    if (!req.body?.title || req.body?.newPrice === undefined) {
      return res.status(400).json({ ok: false, error: 'Nom va yangi narx majburiy' });
    }
    res.status(201).json({ ok: true, data: await ProductModel.create(req.body) });
  } catch (e) { next(e); }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await ProductModel.update(req.params.id, req.body) });
  } catch (e) { next(e); }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await ProductModel.remove(req.params.id) });
  } catch (e) { next(e); }
});

// ================= KATEGORIYALAR =================
router.get('/categories', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await CategoryModel.list(true) });
  } catch (e) { next(e); }
});

router.post('/categories', async (req, res, next) => {
  try {
    if (!req.body?.name) return res.status(400).json({ ok: false, error: 'Kategoriya nomi majburiy' });
    res.status(201).json({ ok: true, data: await CategoryModel.create(req.body) });
  } catch (e) { next(e); }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await CategoryModel.update(req.params.id, req.body) });
  } catch (e) { next(e); }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await CategoryModel.remove(req.params.id) });
  } catch (e) { next(e); }
});

// ================= STORY / BANNER =================
router.get('/stories', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await StoryModel.list(undefined, true) });
  } catch (e) { next(e); }
});

router.post('/stories', async (req, res, next) => {
  try {
    if (!req.body?.imageUrl) return res.status(400).json({ ok: false, error: 'Rasm manzili majburiy' });
    res.status(201).json({ ok: true, data: await StoryModel.create(req.body) });
  } catch (e) { next(e); }
});

router.put('/stories/:id', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await StoryModel.update(req.params.id, req.body) });
  } catch (e) { next(e); }
});

router.delete('/stories/:id', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await StoryModel.remove(req.params.id) });
  } catch (e) { next(e); }
});

// ================= BUYURTMALAR =================
router.get('/orders', async (req, res, next) => {
  try {
    res.json({
      ok: true,
      data: await OrderModel.list({ limit: Number(req.query.limit || 50), status: req.query.status }),
    });
  } catch (e) { next(e); }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await OrderModel.updateStatus(req.params.id, req.body.status) });
  } catch (e) { next(e); }
});

// ================= STATISTIKA VA HISOBOTLAR =================
/** ?days=7 yoki ?days=30 — admin davrni o'zi tanlaydi */
router.get('/report', async (req, res, next) => {
  try {
    const days = Math.min(365, Math.max(1, Number(req.query.days || 7)));
    const [report, users, newUsers, products] = await Promise.all([
      OrderModel.report(days),
      UserModel.count(),
      UserModel.countSince(new Date(Date.now() - days * 86400000)),
      ProductModel.count(),
    ]);
    res.json({ ok: true, data: { ...report, totalUsers: users, newUsers, totalProducts: products } });
  } catch (e) { next(e); }
});

// ================= MATNLAR (SOZLAMALAR) =================
/** Qiymatlar + admin panelida ko'rsatiladigan maydonlar tuzilishi */
router.get('/settings', async (req, res, next) => {
  try {
    await SettingModel.ensureDefaults();
    res.json({
      ok: true,
      data: {
        values: await SettingModel.all(),
        groups: CONTENT_GROUPS,
        defaults: DEFAULT_CONTENT,
      },
    });
  } catch (e) { next(e); }
});

router.put('/settings', async (req, res, next) => {
  try {
    res.json({ ok: true, data: await SettingModel.setMany(req.body) });
  } catch (e) { next(e); }
});

/** Bitta matnni boshlang'ich holatiga qaytarish */
router.post('/settings/:key/reset', async (req, res, next) => {
  try {
    await SettingModel.reset(req.params.key);
    res.json({ ok: true, data: await SettingModel.all() });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

module.exports = router;
