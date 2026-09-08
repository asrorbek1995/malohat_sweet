/**
 * Rasm yuklash — admin galereyadan (telefon/kompyuter xotirasidan) rasm tanlaydi.
 *
 * Fayllar DISKDA emas, BAZADA saqlanadi (Upload modeli).
 * Sababi: Render/Railway kabi xostinglarda disk vaqtinchalik —
 * har deploy'da fayllar o'chib ketardi.
 */
const { Router } = require('express');
const multer = require('multer');
const UploadModel = require('../../models/Upload');
const { requireAdmin } = require('../../middlewares/adminAuth.middleware');
const logger = require('../../utils/logger');

// 4 MB — Vercel proksisi orqali o'tadigan so'rov hajmi chegarasidan past
const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const upload = multer({
  // Fayl xotirada qabul qilinadi va to'g'ridan-to'g'ri bazaga yoziladi
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new Error('Faqat rasm fayllari qabul qilinadi (JPG, PNG, WEBP, GIF)'));
    }
    cb(null, true);
  },
});

const router = Router();

// ---------- Rasmni ko'rsatish (ochiq — do'kon rasmlarni ko'rsatadi) ----------
router.get('/uploads/:name', async (req, res) => {
  try {
    const file = await UploadModel.findByName(req.params.name);
    if (!file) return res.status(404).json({ ok: false, error: 'Rasm topilmadi' });

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.end(Buffer.from(file.data));
  } catch (err) {
    logger.fail('Rasmni o‘qishda xato', err);
    res.status(500).json({ ok: false, error: 'Rasmni o‘qib bo‘lmadi' });
  }
});

// ---------- Rasm yuklash ----------
router.post('/admin/upload', requireAdmin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      logger.warn('Rasm yuklashda xato:', err.message);
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'Rasm hajmi 4 MB dan oshmasligi kerak' : err.message;
      return res.status(400).json({ ok: false, error: message });
    }
    if (!req.file) return res.status(400).json({ ok: false, error: 'Rasm tanlanmadi' });

    try {
      const saved = await UploadModel.save({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      });
      logger.success(`Rasm yuklandi: ${saved.name} (${Math.round(saved.size / 1024)} KB)`);
      res.status(201).json({ ok: true, data: saved });
    } catch (e) {
      logger.fail('Rasmni saqlashda xato', e);
      res.status(500).json({ ok: false, error: 'Rasmni saqlab bo‘lmadi' });
    }
  });
});

// ---------- Galereya ro'yxati ----------
router.get('/admin/uploads', requireAdmin, async (req, res) => {
  try {
    res.json({ ok: true, data: await UploadModel.list() });
  } catch (err) {
    logger.fail('Galereyani o‘qishda xato', err);
    res.json({ ok: true, data: [] });
  }
});

// ---------- Rasmni o'chirish ----------
router.delete('/admin/uploads/:name', requireAdmin, async (req, res) => {
  try {
    res.json({ ok: true, data: await UploadModel.remove(req.params.name) });
  } catch {
    res.status(404).json({ ok: false, error: 'Rasm topilmadi' });
  }
});

module.exports = router;
