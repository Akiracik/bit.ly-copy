const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  // Kullanıcı oluşturma
  async createUser(userData) {
    const connection = await pool.getConnection();
    
    try {
      // Email veya kullanıcı adı zaten var mı kontrol et
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [userData.email, userData.username]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('Bu email veya kullanıcı adı zaten kullanılıyor');
      }
      
      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Yeni kullanıcı ID'si oluştur
      const userId = uuidv4();
      
      // Kullanıcıyı kaydet
      await connection.query(
        'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [userId, userData.username, userData.email, hashedPassword, userData.role || 'user']
      );
      
      // Yeni oluşturulan kullanıcıyı getir
      const [users] = await connection.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      return users[0];
    } finally {
      connection.release();
    }
  }
  
  // Email ile kullanıcı bulma
  async findByEmail(email) {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // ID ile kullanıcı bulma
  async findById(id) {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // Şifre doğrulama
  async checkPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Kullanıcıyı güncelleme
  async updateUser(id, updateData) {
    const connection = await pool.getConnection();
    
    try {
      // Güncelleme durumuna göre SQL oluştur
      let updates = [];
      let values = [];
      
      if (updateData.username) {
        updates.push('username = ?');
        values.push(updateData.username);
      }
      
      if (updateData.email) {
        updates.push('email = ?');
        values.push(updateData.email);
      }
      
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateData.password, salt);
        updates.push('password = ?');
        values.push(hashedPassword);
      }
      
      if (updates.length === 0) {
        throw new Error('En az bir alan güncellenmelidir');
      }
      
      // Güncelleme sorgusu
      values.push(id);
      await connection.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      // Güncel kullanıcı bilgilerini getir
      const [users] = await connection.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }
  
  // Kullanıcı silme
  async deleteUser(id) {
    const connection = await pool.getConnection();
    
    try {
      // Kullanıcıya ait linklerdeki kullanıcı ID'sini null yap
      await connection.query(
        'UPDATE links SET user_id = NULL WHERE user_id = ?',
        [id]
      );
      
      // Kullanıcıyı sil
      const [result] = await connection.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserModel();