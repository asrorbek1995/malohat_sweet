/**
 * Express REST API — Next.js frontend shu serverga murojaat qiladi.
 */
const express = require('express');
const cors = require('cors');
const config = require('../config/default');
const logger = require('../utils/logger');
const shopRoutes = require('./routes/shop.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

/**
 * @param {import('telegraf').Telegraf} bot
 */
function createServer(bot) {
  const app = express();

  app.use(
    cors({
      origin: config.api.corsOrigins.length ? config.api.corsOrigins : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));

  // Sog'liq tekshiruvi
  app.get('/health', (req, res) =>
    res.json({ ok: true, service: 'malohat-backend', time: new Date().toISOString() })
  );

  // Rasm yuklash va yuklangan rasmlarni berish
  app.use('/api', uploadRoutes);
  app.use('/api', shopRoutes(bot));
  app.use('/api/admin', adminRoutes);

  // 404
  app.use((req, res) => res.status(404).json({ ok: false, error: 'Topilmadi' }));

  // Xatoliklarni ushlash
  app.use((err, req, res, _next) => {
    logger.fail(`API xatosi ${req.method} ${req.originalUrl}`, err);
    res.status(500).json({ ok: false, error: 'Serverda xatolik yuz berdi' });
  });

  return app;
}

/** Serverni ishga tushirish */
function startServer(bot) {
  const app = createServer(bot);
  return new Promise((resolve) => {
    const server = app.listen(config.api.port, () => {
      logger.success(`API server ishlamoqda: http://localhost:${config.api.port}`);
      resolve(server);
    });
  });
}

module.exports = { createServer, startServer };
