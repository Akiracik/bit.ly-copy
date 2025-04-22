const express = require('express');
const viewController = require('../controllers/viewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ana sayfa
router.get('/', viewController.homePage);

// Giriş sayfası
router.get('/login', viewController.loginPage);

// Kayıt sayfası
router.get('/register', viewController.registerPage);

// Dashboard sayfası (oturum gerektirir)
router.get('/dashboard', protect, viewController.dashboardPage);

// İstatistik sayfası (oturum gerektirir)
router.get('/stats/:id', protect, viewController.statsPage);

module.exports = router;