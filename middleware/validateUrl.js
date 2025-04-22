const validator = require('validator');

// URL doğrulama ara katmanı
module.exports = (req, res, next) => {
  // URL'yi body'den al
  const url = req.body.url;
  
  // URL yoksa
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL gereklidir' });
  }
  
  // URL formatı doğru mu?
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'], 
    require_protocol: true,
    require_valid_protocol: true
  })) {
    return res.status(400).json({ success: false, error: 'Geçerli bir URL giriniz (http:// veya https:// ile başlamalıdır)' });
  }
  
  // Yasaklı domain kontrolü
  const blockedDomains = ['evil.com', 'malware.com', 'phishing.com'];
  const urlObj = new URL(url);
  
  if (blockedDomains.includes(urlObj.hostname)) {
    return res.status(400).json({ success: false, error: 'Bu domain yasaklanmıştır' });
  }
  
  // Her şey yolundaysa devam et
  next();
};