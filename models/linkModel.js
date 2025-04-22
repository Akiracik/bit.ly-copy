const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const config = require('../config/config');

class LinkModel {
  // Kısa link oluşturma
  async createLink(linkData) {
    const connection = await pool.getConnection();
    
    try {
      // Kısa kod oluştur
      let shortCode = linkData.customCode || nanoid(config.codeLength);
      
      // Kod benzersiz mi kontrol et
      const [existingLinks] = await connection.query(
        'SELECT id FROM links WHERE short_code = ?',
        [shortCode]
      );
      
      if (existingLinks.length > 0) {
        if (linkData.customCode) {
          throw new Error('Bu özel kod zaten kullanılıyor');
        }
        // Özel kod değilse, yeni bir tane oluştur
        shortCode = nanoid(config.codeLength);
      }
      
      // Yeni link ID'si oluştur
      const linkId = uuidv4();
      
      // Linki kaydet
      await connection.query(
        'INSERT INTO links (id, original_url, short_code, user_id, expires_at) VALUES (?, ?, ?, ?, ?)',
        [linkId, linkData.originalUrl, shortCode, linkData.userId || null, linkData.expiresAt || null]
      );
      
      // Yeni oluşturulan linki getir
      const [links] = await connection.query(
        'SELECT * FROM links WHERE id = ?',
        [linkId]
      );
      
      return links[0];
    } finally {
      connection.release();
    }
  }
  
  // Kısa kod ile link bulma
  async findByShortCode(shortCode) {
    const connection = await pool.getConnection();
    
    try {
      const [links] = await connection.query(
        'SELECT * FROM links WHERE short_code = ?',
        [shortCode]
      );
      
      return links.length > 0 ? links[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // ID ile link bulma
  async findById(id) {
    const connection = await pool.getConnection();
    
    try {
      const [links] = await connection.query(
        'SELECT * FROM links WHERE id = ?',
        [id]
      );
      
      return links.length > 0 ? links[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // Kullanıcının linklerini getirme
  async findByUserId(userId, page = 1, limit = 10) {
    const connection = await pool.getConnection();
    
    try {
      // Toplam link sayısı
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as total FROM links WHERE user_id = ?',
        [userId]
      );
      
      const total = countResult[0].total;
      
      // Sayfalama
      const offset = (page - 1) * limit;
      
      // Kullanıcının linklerini getir
      const [links] = await connection.query(
        'SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      return {
        links,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } finally {
      connection.release();
    }
  }
  
  // Tıklama sayısını artırma
  async incrementClicks(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE links SET clicks = clicks + 1 WHERE id = ?',
        [id]
      );
      
      const [links] = await connection.query(
        'SELECT * FROM links WHERE id = ?',
        [id]
      );
      
      return links.length > 0 ? links[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // Link güncelleme
  async updateLink(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      // Güncelleme durumuna göre SQL oluştur
      let updates = [];
      let values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'id') {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        throw new Error('En az bir alan güncellenmelidir');
      }
      
      // Güncelleme sorgusu
      values.push(id);
      await connection.query(
        `UPDATE links SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      // Güncel link bilgilerini getir
      const [links] = await connection.query(
        'SELECT * FROM links WHERE id = ?',
        [id]
      );
      
      return links.length > 0 ? links[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // Link silme
  async deleteLink(id) {
    const connection = await pool.getConnection();
    
    try {
      // Önce tıklama verilerini sil
      await connection.query(
        'DELETE FROM clicks WHERE link_id = ?',
        [id]
      );
      
      // Sonra linki sil
      const [result] = await connection.query(
        'DELETE FROM links WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
  
  // En çok tıklanan linkleri getirme
  async getTopLinks(limit = 10) {
    const connection = await pool.getConnection();
    
    try {
      const [links] = await connection.query(
        'SELECT * FROM links ORDER BY clicks DESC LIMIT ?',
        [limit]
      );
      
      return links;
    } finally {
      connection.release();
    }
  }
  
  // Toplam link sayısı
  async getTotalLinks() {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query('SELECT COUNT(*) as count FROM links');
      return result[0].count;
    } finally {
      connection.release();
    }
  }
  
  // Bugün oluşturulan link sayısı
  async getTodayLinks() {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'SELECT COUNT(*) as count FROM links WHERE DATE(created_at) = CURDATE()'
      );
      return result[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = new LinkModel();