-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS akira_bitly;
USE akira_bitly;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Linkler tablosu
CREATE TABLE IF NOT EXISTS links (
  id VARCHAR(36) PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) NOT NULL UNIQUE,
  user_id VARCHAR(36),
  clicks INT UNSIGNED DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tıklamalar tablosu
CREATE TABLE IF NOT EXISTS clicks (
  id VARCHAR(36) PRIMARY KEY,
  link_id VARCHAR(36) NOT NULL,
  ip_address VARCHAR(45),
  country VARCHAR(50),
  city VARCHAR(100),
  user_agent TEXT,
  browser VARCHAR(50),
  os VARCHAR(50),
  device VARCHAR(20),
  referrer TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- Admin kullanıcısı ekle (şifre: admin123)
INSERT INTO users (id, username, email, password, role)
VALUES (
  UUID(),
  'admin',
  'admin@akira-bitly.com',
  '$2a$10$rQenQhW7Ug/9EXD66TjfYOqCnzK48Zc3g5jANMZxX5xdTl8IPG7cW',
  'admin'
);