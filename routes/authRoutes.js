const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Giriş sayfası - EJS şablonu ile
router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Giriş Yap' });
});

// Kayıt sayfası - EJS şablonu ile
router.get('/register', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', { title: 'Kayıt Ol' });
});

// Dashboard sayfası - EJS şablonu ile
router.get('/dashboard', protect, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user
  });
});

// Kayıt validasyonu
const registerValidation = [
  check('username', 'Kullanıcı adı gereklidir').not().isEmpty(),
  check('username', 'Kullanıcı adı en az 3 karakter olmalıdır').isLength({ min: 3 }),
  check('email', 'Geçerli bir email adresi giriniz').isEmail(),
  check('password', 'Şifre en az 8 karakter olmalıdır').isLength({ min: 8 })
];

// Giriş validasyonu
const loginValidation = [
  check('email', 'Geçerli bir email adresi giriniz').isEmail(),
  check('password', 'Şifre gereklidir').exists()
];

// Kullanıcı kayıt
router.post(
  '/register',
  registerLimiter,
  registerValidation,
  authController.register
);

// Kullanıcı giriş
router.post(
  '/login',
  loginLimiter,
  loginValidation,
  authController.login
);

// Kullanıcı çıkış
router.get(
  '/logout',
  authController.logout
);

// Kullanıcı bilgisi
router.get(
  '/me',
  protect,
  authController.getMe
);

// Kullanıcı güncelleme
router.put(
  '/me',
  protect,
  authController.updateUser
);

module.exports = router;