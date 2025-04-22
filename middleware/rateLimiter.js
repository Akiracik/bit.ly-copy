const rateLimit = require('express-rate-limit');

// URL oluşturma için hız sınırlayıcı
exports.createLinkLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 10, // dakikada max 10 istek
  message: { success: false, error: 'Çok fazla URL kısaltma isteği. Lütfen bir dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Kullanıcı kaydı için hız sınırlayıcı
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5, // saatte max 5 kayıt
  message: { success: false, error: 'Çok fazla kayıt isteği. Lütfen bir saat sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Giriş için hız sınırlayıcı
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // 15 dakikada max 10 giriş
  message: { success: false, error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false
});