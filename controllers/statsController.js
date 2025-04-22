const linkModel = require('../models/linkModel');
const clickModel = require('../models/clickModel');
const config = require('../config/config');

// Link istatistikleri
exports.getLinkStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Linki bul
    const link = await linkModel.findById(id);
    
    // Link yoksa
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link bulunamadı' });
    }
    
    // Link kullanıcıya ait değilse ve admin değilse
    if (link.userId && link.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }
    
    // İstatistikleri al
    const stats = await clickModel.getClickStats(link.id);
    
    res.status(200).json({
      success: true,
      data: {
        link: {
          id: link.id,
          originalUrl: link.originalUrl,
          shortUrl: `${config.baseUrl}/${link.shortCode}`,
          shortCode: link.shortCode,
          createdAt: link.createdAt
        },
        stats
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};

// Genel istatistikler (Admin için)
exports.getGlobalStats = async (req, res) => {
  try {
    // Toplam link sayısı
    const totalLinks = await linkModel.getTotalLinks();
    
    // Toplam tıklama sayısı
    const totalClicks = await clickModel.getTotalClicks();
    
    // Bugün oluşturulan link sayısı
    const todayLinks = await linkModel.getTodayLinks();
    
    // Bugünkü tıklama sayısı
    const todayClicks = await clickModel.getTodayClicks();
    
    // En çok tıklanan 10 link
    const topLinks = await linkModel.getTopLinks(10);
    
    // Formatlanmış top linkler
    const formattedTopLinks = topLinks.map(link => ({
      id: link.id,
      originalUrl: link.originalUrl,
      shortUrl: `${config.baseUrl}/${link.shortCode}`,
      shortCode: link.shortCode,
      clicks: link.clicks,
      createdAt: link.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: {
        totalLinks,
        totalClicks,
        todayLinks,
        todayClicks,
        topLinks: formattedTopLinks
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Sunucu hatası' });
  }
};