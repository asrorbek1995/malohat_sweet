/**
 * Ochiq (public) API — frontend do'kon sahifalari uchun.
 */
const { Router } = require('express');
const ProductModel = require('../../models/Product');
const CategoryModel = require('../../models/Category');
const StoryModel = require('../../models/Story');
const SettingModel = require('../../models/Setting');
const OrderModel = require('../../models/Order');
const cartController = require('../../controllers/cartController');
const logger = require('../../utils/logger');

/**
 * @param {import('telegraf').Telegraf} bot — adminga xabar yuborish uchun
 */
module.exports = function shopRoutes(bot) {
  const router = Router();

  // ---------- Kategoriyalar ----------
  router.get('/categories', async (req, res, next) => {
    try {
      res.json({ ok: true, data: await CategoryModel.list() });
    } catch (err) {
      next(err);
    }
  });

  // ---------- Mahsulotlar ----------
  router.get('/products', async (req, res, next) => {
    try {
      const data = await ProductModel.list({
        categoryId: req.query.categoryId,
        bestSeller: req.query.bestSeller === 'true',
        search: req.query.search,
        excludeBump: true,
      });
      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  });

  router.get('/products/:id', async (req, res, next) => {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) return res.status(404).json({ ok: false, error: 'Mahsulot topilmadi' });
      res.json({ ok: true, data: product });
    } catch (err) {
      next(err);
    }
  });

  // ---------- Order Bump mahsuloti ----------
  router.get('/order-bump', async (req, res, next) => {
    try {
      res.json({ ok: true, data: await ProductModel.findOrderBump() });
    } catch (err) {
      next(err);
    }
  });

  // ---------- Storislar / Bannerlar ----------
  router.get('/stories', async (req, res, next) => {
    try {
      const type = req.query.type ? String(req.query.type).toUpperCase() : undefined;
      res.json({ ok: true, data: await StoryModel.list(type) });
    } catch (err) {
      next(err);
    }
  });

  // ---------- Sozlamalar ----------
  router.get('/settings', async (req, res, next) => {
    try {
      res.json({ ok: true, data: await SettingModel.all() });
    } catch (err) {
      next(err);
    }
  });

  // ---------- Buyurtma yaratish ----------
  router.post('/orders', async (req, res, next) => {
    try {
      const { customerName, phone, address, comment, items, telegramId, username } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ ok: false, error: 'Savat bo‘sh' });
      }
      if (!customerName || String(customerName).trim().length < 2) {
        return res.status(400).json({ ok: false, error: 'Ismingizni kiriting' });
      }

      const order = await cartController.createOrder(bot, {
        customerName: String(customerName).trim(),
        phone,
        address,
        comment,
        items,
        telegramId,
        username,
      });

      res.status(201).json({ ok: true, data: order });
    } catch (err) {
      logger.fail('Buyurtma API xatosi', err);
      res.status(400).json({ ok: false, error: err.message });
    }
  });

  // ---------- Foydalanuvchining buyurtmalari ----------
  router.get('/orders/my/:telegramId', async (req, res, next) => {
    try {
      res.json({ ok: true, data: await OrderModel.listByTelegramId(req.params.telegramId) });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
