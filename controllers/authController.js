const userModel = require('../models/userModel');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { username, email, password } = req.body;
    
    // Yeni kullanıcı oluştur
    const user = await userModel.createUser({
      username,
      email,
      password
    });
    
    // Token oluştur
    const token = generateToken(user.id);
    
    // Oturuma token'ı kaydet
    req.session.token = token;
    
    // Kullanıcı bilgilerini döndür
    res.status(201).json({
      success: true,
      user,
      token
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Email ile kullanıcıyı bul
    const user = await userModel.findByEmail(email);
    
    // Kullanıcı yoksa
    if (!user) {
      return res.status(401).json({ success: false, error: 'Geçersiz kimlik bilgileri' });
    }
    
    // Şifre doğrulama
    const isMatch = await userModel.checkPassword(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Geçersiz kimlik bilgileri' });
    }
    
    // Token oluştur
    const token = generateToken(user.id);
    
    // Oturuma token'ı kaydet
    req.session.token = token;
    
    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};

// Kullanıcı çıkış
exports.logout = (req, res) => {
  // Oturumu temizle
  req.session.destroy();
  
  res.status(200).json({ success: true, message: 'Başarıyla çıkış yapıldı' });
};

// Kullanıcı bilgilerini getir
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }
    
    // Şifre hariç kullanıcı bilgilerini döndür
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};

// Kullanıcı bilgilerini güncelleme
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;
    
    // Sadece izin verilen alanları güncelle
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    const updatedUser = await userModel.updateUser(userId, updateData);
    
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};