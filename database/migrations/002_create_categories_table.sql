-- Migration: Create categories table
-- Description: Stores complaint categories
-- Created: 2026-01-09

-- UP Migration
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Infrastruktur', 'Pengaduan terkait jalan, jembatan, fasilitas umum'),
('Kesehatan', 'Pengaduan layanan kesehatan, puskesmas, rumah sakit'),
('Pendidikan', 'Pengaduan terkait sekolah dan fasilitas pendidikan'),
('Kebersihan', 'Pengaduan sampah, drainase, dan kebersihan lingkungan'),
('Keamanan', 'Pengaduan terkait keamanan dan ketertiban'),
('Administrasi', 'Pengaduan layanan administrasi kependudukan'),
('Lainnya', 'Pengaduan lain yang tidak termasuk kategori di atas');

-- DOWN Migration (untuk rollback)
-- DROP TABLE IF EXISTS categories;
