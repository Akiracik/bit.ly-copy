const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config/config');

// JWT token oluşturma
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// Kimlik doğrulama kontrolü
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Token kontrolü
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.session.token) {
      token = req.session.token;
    }
    
    // Token yoksa
    if (!token) {
      if (req.xhr || req.path.startsWith('/api/')) {
        return res.status(401).json({ success: false, error: 'Bu kaynağa erişim için kimlik doğrulaması gereklidir' });
      }
      return res.redirect('/login');
    }
    
    // Token doğrulama
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Token geçerliyse kullanıcıyı bul
    const user = await userModel.findById(decoded.id);
    
    if (!user) {
      if (req.xhr || req.path.startsWith('/api/')) {
        return res.status(401).json({ success: false, error: 'Geçersiz token, kullanıcı bulunamadı' });
      }
      return res.redirect('/login');
    }
    
    // Kullanıcıyı request nesnesine ekle
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, error: 'Geçersiz token' });
    }
    return res.redirect('/login');
  }
};

// Admin kontrolü
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(403).json({ success: false, error: 'Bu kaynağa erişim için admin yetkisi gereklidir' });
    }
    return res.status(403).render('errors/403', { title: 'Erişim Engellendi' });
  }
};