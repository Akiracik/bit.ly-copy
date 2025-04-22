const express = require('express');
const { check } = require('express-validator');
const linkController = require('../controllers/linkController');
const { protect } = require('../middleware/auth');
const validateUrl = require('../middleware/validateUrl');
const { createLinkLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Ana sayfa - EJS şablonu ile
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Akira URL Kısaltma',
    user: req.user || null
  });
});

// Kısa URL oluşturma - kimlik doğrulama gerekmez, ama hız sınırı var
router.post(
  '/api/links',
  createLinkLimiter,
  validateUrl,
  linkController.shortenUrl
);

// Oturum açmış kullanıcı için URL oluşturma
router.post(
  '/api/links/user',
  protect,
  validateUrl,
  linkController.shortenUrl
);

// Kullanıcının linklerini getir
router.get(
  '/api/links',
  protect,
  linkController.getUserLinks
);

// Link durumunu değiştir
router.put(
  '/api/links/:id/toggle',
  protect,
  linkController.toggleLinkStatus
);

// Link sil
router.delete(
  '/api/links/:id',
  protect,
  linkController.deleteLink
);

module.exports = router;