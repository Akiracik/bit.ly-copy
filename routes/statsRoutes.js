const express = require('express');
const statsController = require('../controllers/statsController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// İstatistik sayfası - EJS şablonu ile
router.get('/stats/:id', protect, (req, res) => {
  res.render('stats', {
    title: 'Link İstatistikleri',
    user: req.user,
    linkId: req.params.id
  });
});

// Link istatistiklerini getir
router.get(
  '/links/:id',
  protect,
  statsController.getLinkStats
);

// Genel istatistikleri getir (admin)
router.get(
  '/global',
  protect,
  admin,
  statsController.getGlobalStats
);

module.exports = router;