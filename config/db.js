const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'akira_bitly',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Veritabanı bağlantısını test et
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL veritabanına başarıyla bağlandı');
    connection.release();
  } catch (error) {
    console.error('MySQL bağlantı hatası:', error);
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection
};