const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class ClickModel {
  // Tıklama kaydetme
  async recordClick(clickData) {
    const connection = await pool.getConnection();
    
    try {
      const { linkId, ipAddress, country, city, userAgent, browser, os, device, referrer } = clickData;
      
      // Yeni tıklama ID'si oluştur
      const clickId = uuidv4();
      
      // Tıklamayı kaydet
      await connection.query(
        `INSERT INTO clicks 
        (id, link_id, ip_address, country, city, user_agent, browser, os, device, referrer) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clickId, linkId, ipAddress, country, city, userAgent, browser, os, device, referrer]
      );
      
      // Kaydedilen tıklamayı getir
      const [clicks] = await connection.query(
        'SELECT * FROM clicks WHERE id = ?',
        [clickId]
      );
      
      return clicks.length > 0 ? clicks[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // Link için tüm tıklamaları getirme
  async getClicksByLinkId(linkId) {
    const connection = await pool.getConnection();
    
    try {
      const [clicks] = await connection.query(
        'SELECT * FROM clicks WHERE link_id = ? ORDER BY timestamp DESC',
        [linkId]
      );
      
      return clicks;
    } finally {
      connection.release();
    }
  }
  
  // Link için tıklama sayısı
  async getClickCountByLinkId(linkId) {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'SELECT COUNT(*) as count FROM clicks WHERE link_id = ?',
        [linkId]
      );
      
      return result[0].count;
    } finally {
      connection.release();
    }
  }
  
  // Belirli bir tarihten sonraki tıklamaları getirme
  async getClicksAfterDate(linkId, date) {
    const connection = await pool.getConnection();
    
    try {
      const [clicks] = await connection.query(
        'SELECT * FROM clicks WHERE link_id = ? AND timestamp >= ? ORDER BY timestamp DESC',
        [linkId, date]
      );
      
      return clicks;
    } finally {
      connection.release();
    }
  }
  
  // Tıklama istatistikleri oluşturma
  async getClickStats(linkId) {
    const connection = await pool.getConnection();
    
    try {
      // Toplam tıklama sayısı
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as total FROM clicks WHERE link_id = ?',
        [linkId]
      );
      
      const totalClicks = countResult[0].total;
      
      // Benzersiz IP sayısı
      const [uniqueResult] = await connection.query(
        'SELECT COUNT(DISTINCT ip_address) as unique_visitors FROM clicks WHERE link_id = ?',
        [linkId]
      );
      
      const uniqueVisitors = uniqueResult[0].unique_visitors;
      
      // Günlük tıklama verileri
      const [dailyClicks] = await connection.query(
        `SELECT DATE(timestamp) as date, COUNT(*) as count 
         FROM clicks 
         WHERE link_id = ? 
         GROUP BY DATE(timestamp) 
         ORDER BY date`,
        [linkId]
      );
      
      // Ülkelere göre tıklamalar
      const [countries] = await connection.query(
        `SELECT country, COUNT(*) as count 
         FROM clicks 
         WHERE link_id = ? 
         GROUP BY country 
         ORDER BY count DESC`,
        [linkId]
      );
      
      // Tarayıcılara göre tıklamalar
      const [browsers] = await connection.query(
        `SELECT browser, COUNT(*) as count 
         FROM clicks 
         WHERE link_id = ? 
         GROUP BY browser 
         ORDER BY count DESC`,
        [linkId]
      );
      
      // Cihazlara göre tıklamalar
      const [devices] = await connection.query(
        `SELECT device, COUNT(*) as count 
         FROM clicks 
         WHERE link_id = ? 
         GROUP BY device 
         ORDER BY count DESC`,
        [linkId]
      );
      
      // Yönlendirenlere göre tıklamalar
      const [referrers] = await connection.query(
        `SELECT referrer, COUNT(*) as count 
         FROM clicks 
         WHERE link_id = ? 
         GROUP BY referrer 
         ORDER BY count DESC 
         LIMIT 10`,
        [linkId]
      );
      
      // Son 10 tıklama
      const [recentClicks] = await connection.query(
        `SELECT * 
         FROM clicks 
         WHERE link_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 10`,
        [linkId]
      );
      
      return {
        totalClicks,
        uniqueVisitors,
        dailyClicks,
        countries,
        browsers,
        devices,
        referrers,
        recentClicks
      };
    } finally {
      connection.release();
    }
  }
  
  // Toplam tıklama sayısı
  async getTotalClicks() {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query('SELECT COUNT(*) as count FROM clicks');
      return result[0].count;
    } finally {
      connection.release();
    }
  }
  
  // Bugünkü tıklama sayısı
  async getTodayClicks() {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'SELECT COUNT(*) as count FROM clicks WHERE DATE(timestamp) = CURDATE()'
      );
      return result[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ClickModel();