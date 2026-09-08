/**
 * Admin panel uchun REST API himoyasi.
 * Kirish faqat bot yuborgan bir martalik 4 xonali kod orqali (src/core/adminCodes.js),
 * shu kod tasdiqlangach 12 soatlik JWT beriladi.
 */
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const logger = require('../utils/logger');

/** Kod tasdiqlangandan so'ng chaqiriladi — 12 soatlik token qaytaradi */
function issueToken(telegramId) {
  return jwt.sign({ telegramId: String(telegramId), role: 'ADMIN' }, config.api.jwtSecret, {
    expiresIn: '12h',
  });
}

/** Himoyalangan endpointlar uchun middleware */
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Avtorizatsiya talab qilinadi' });
  }

  try {
    const payload = jwt.verify(token, config.api.jwtSecret);
    if (payload.role !== 'ADMIN' || String(payload.telegramId) !== String(config.admin.telegramId)) {
      return res.status(403).json({ ok: false, error: 'Ruxsat yo‘q' });
    }
    req.admin = payload;
    return next();
  } catch (err) {
    logger.warn('Yaroqsiz admin tokeni:', err.message);
    return res.status(401).json({ ok: false, error: 'Token yaroqsiz yoki muddati tugagan' });
  }
}

module.exports = { issueToken, requireAdmin };
