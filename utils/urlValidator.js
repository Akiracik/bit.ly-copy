const validator = require('validator');

/**
 * URL doğrulama yardımcıları
 */
class UrlValidator {
  /**
   * URL'nin geçerli olup olmadığını kontrol eder
   * @param {string} url - Kontrol edilecek URL
   * @returns {boolean} - URL geçerliyse true, değilse false
   */
  isValidUrl(url) {
    if (!url) return false;
    
    try {
      return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true
      });
    } catch (error) {
      return false;
    }
  }
  
  /**
   * URL'nin yasaklı bir domaine sahip olup olmadığını kontrol eder
   * @param {string} url - Kontrol edilecek URL
   * @returns {boolean} - URL yasaklı bir domaine sahipse true, değilse false
   */
  isBlockedDomain(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Yasaklı domainler listesi
      const blockedDomains = [
        'evil.com',
        'malware.com',
        'phishing.com',
        'malicious-site.com',
        'virus.com',
        'spam.com',
        'scam.com'
      ];
      
      return blockedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch (error) {
      // URL parse edilemiyorsa, geçersiz kabul et
      return true;
    }
  }
  
  /**
   * URL'nin alan adı kısmını çıkarır
   * @param {string} url - URL
   * @returns {string|null} - Alan adı veya null (geçersiz URL ise)
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * URL'nin path kısmını çıkarır
   * @param {string} url - URL
   * @returns {string|null} - Path veya null (geçersiz URL ise)
   */
  extractPath(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Kısa kod/slug formatını doğrular
   * @param {string} code - Doğrulanacak kod
   * @returns {boolean} - Kod geçerli formatta ise true, değilse false
   */
  isValidCode(code) {
    // Sadece harf, rakam, tire ve alt çizgi içerebilir
    return /^[a-zA-Z0-9_-]+$/.test(code);
  }
  
  /**
   * URL'nin potansiyel olarak zararlı olup olmadığını kontrol eder
   * @param {string} url - Kontrol edilecek URL
   * @returns {boolean} - URL potansiyel olarak zararlıysa true, değilse false
   */
  isPotentiallyMalicious(url) {
    if (!this.isValidUrl(url)) return true;
    
    // Yasaklı domain kontrolü
    if (this.isBlockedDomain(url)) return true;
    
    // Şüpheli parametreler kontrolü
    const suspiciousParams = ['cmd', 'exec', 'eval', 'payload', 'hack', 'exploit'];
    try {
      const urlObj = new URL(url);
      for (const param of urlObj.searchParams.keys()) {
        if (suspiciousParams.includes(param.toLowerCase())) {
          return true;
        }
      }
    } catch (error) {
      return true;
    }
    
    // Şüpheli anahtar kelimeler kontrolü
    const suspiciousKeywords = ['phishing', 'malware', 'trojan', 'hack', 'crack', 'warez', 'keygen', 'pirate'];
    const lowerUrl = url.toLowerCase();
    
    for (const keyword of suspiciousKeywords) {
      if (lowerUrl.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }
}

module.exports = new UrlValidator();