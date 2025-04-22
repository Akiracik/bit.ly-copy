const linkModel = require('../models/linkModel');
const clickModel = require('../models/clickModel');
const validator = require('validator');
const config = require('../config/config');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

// URL kısaltma
exports.shortenUrl = async (req, res) => {
  try {
    const { url, customCode } = req.body;
    
    // URL kontrolü
    if (!url || !validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      return res.status(400).json({ success: false, error: 'Geçerli bir URL giriniz' });
    }
    
    // Yasaklı domain kontrolü
    const blockedDomains = ['evil.com', 'malware.com', 'phishing.com'];
    const urlObj = new URL(url);
    
    if (blockedDomains.includes(urlObj.hostname)) {
      return res.status(400).json({ success: false, error: 'Bu domain yasaklanmıştır' });
    }
    
    // Özel kod kontrolü (varsa)
    if (customCode) {
      // Özel kod formatı kontrolü
      if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Özel kod sadece harf, rakam, tire ve alt çizgi içerebilir'
        });
      }
    }
    
    // Link oluştur
    const newLink = await linkModel.createLink({
      originalUrl: url,
      customCode,
      userId: req.user ? req.user.id : null
    });
    
    // Başarılı yanıt döndür
    res.status(201).json({
      success: true,
      data: {
        id: newLink.id,
        originalUrl: newLink.originalUrl,
        shortUrl: `${config.baseUrl}/${newLink.shortCode}`,
        shortCode: newLink.shortCode,
        clicks: 0,
        createdAt: newLink.createdAt
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};

// Kısa linke tıklama ve yönlendirme
exports.redirectToUrl = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Kodu ara
    const link = await linkModel.findByShortCode(code);
    
    // Link yoksa veya aktif değilse
    if (!link || !link.active) {
      return res.status(404).render('errors/404', { title: 'Link Bulunamadı' });
    }
    
    // Link süresi dolmuş mu?
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return res.status(410).render('errors/410', { title: 'Link Süresi Dolmuş' });
    }
    
    // Tıklama istatistikleri toplama
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    const ip = req.headers['x-forwarded-for'] || req.ip || '0.0.0.0';
    const geo = ip ? geoip.lookup(ip.split(',')[0]) : null;
    
    // Tıklama kaydet
    await clickModel.recordClick({
      linkId: link.id,
      ipAddress: ip,
      country: geo ? geo.country : null,
      city: geo ? geo.city : null,
      userAgent: userAgent,
      browser: uaResult.browser.name,
      os: uaResult.os.name,
      device: uaResult.device.type || 'desktop',
      referrer: req.headers.referer || 'direct'
    });
    
    // Tıklama sayısını artır
    await linkModel.incrementClicks(link.id);
    
    // Yönlendir
    return res.redirect(link.originalUrl);
    
  } catch (error) {
    console.error(error);
    return res.status(500).render('errors/500', { title: 'Sunucu Hatası' });
  }
};

// Kullanıcının linklerini getir
exports.getUserLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Kullanıcının linklerini getir
    const result = await linkModel.findByUserId(req.user.id, page, limit);
    
    // Link verisini formatla
    const formattedLinks = result.links.map(link => ({
      id: link.id,
      originalUrl: link.originalUrl,
      shortUrl: `${config.baseUrl}/${link.shortCode}`,
      shortCode: link.shortCode,
      clicks: link.clicks,
      active: link.active,
      createdAt: link.createdAt
    }));
    
    // Sayfalama bilgisi
    const pagination = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.totalPages
    };
    
    res.status(200).json({
      success: true,
      count: formattedLinks.length,
      pagination,
      data: formattedLinks
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};

// Link devre dışı bırakma / aktifleştirme
exports.toggleLinkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Linki bul
    const link = await linkModel.findById(id);
    
    // Link yoksa
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link bulunamadı' });
    }
    
    // Link kullanıcıya ait değilse
    if (link.userId && link.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }
    
    // Durumu tersine çevir
    const updatedLink = await linkModel.updateLink(id, { active: !link.active });
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedLink.id,
        active: updatedLink.active
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};

// Link silme
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Linki bul
    const link = await linkModel.findById(id);
    
    // Link yoksa
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link bulunamadı' });
    }
    
    // Link kullanıcıya ait değilse
    if (link.userId && link.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }
    
    // Linki sil
    await linkModel.deleteLink(id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};