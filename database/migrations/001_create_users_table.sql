-- Migration: Create users table
-- Description: Stores both regular users and admin accounts
-- Created: 2026-01-09

-- UP Migration
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account (password: admin123)
-- Note: Hash ini adalah bcrypt hash dari 'admin123'
INSERT INTO users (name, email, password, phone, role) VALUES
('Administrator', 'admin@pengaduan.com', '$2a$10$YourHashedPasswordHere', '081234567890', 'admin');

-- DOWN Migration (untuk rollback)
-- DROP TABLE IF EXISTS users;
