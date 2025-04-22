const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Yükle .env değişkenleri
dotenv.config();

// Veritabanı bağlantısını test et
testConnection();

const app = express();

// Güvenlik başlıkları
app.use(helmet({ contentSecurityPolicy: false }));

// CORS ayarları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter - tüm API istekleri için
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // maksimum 100 istek
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.' }
});
app.use('/api', apiLimiter);

// Oturum yönetimi
app.use(session({
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hafta
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // Sadece production modunda HTTPS gerektirir
  }
}));

// View engine kurulumu (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Rotalar
app.use('/', require('./routes/viewRoutes'));  // Sayfa görünümleri için
app.use('/api/links', require('./routes/linkRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Kısa link yönlendirme işlemi
app.get('/:code', require('./controllers/linkController').redirectToUrl);

// Hata sayfaları
const viewController = require('./controllers/viewController');
app.use(viewController.notFoundPage);
app.use(viewController.errorPage);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${process.env.NODE_ENV} modunda ${PORT} portunda başlatıldı`));