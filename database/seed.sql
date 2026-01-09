-- Seed data for testing
-- Sistem Pengaduan Layanan Publik

USE pengaduan_db;

-- Clear existing data (optional, for fresh start)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE responses;
-- TRUNCATE TABLE complaints;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- Insert test users
-- Password untuk semua user: password123
-- Hash: $2a$10$YHqE/jHvVvTwjvlT3w8j6.M1VhJXQRq3BKzYwX4DpN8sV2VJ5qE6a (example)
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin System', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 'admin'),
('John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567891', 'user'),
('Jane Smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567892', 'user');

-- Categories already inserted in migration 002

-- Insert test complaints
INSERT INTO complaints (user_id, category_id, title, description, status) VALUES
(2, 1, 'Jalan Berlubang di Jl. Sudirman', 'Jalan berlubang cukup besar di depan kantor pos, berbahaya untuk pengendara motor', 'pending'),
(2, 4, 'Sampah Menumpuk di TPS', 'Sampah di TPS Kelurahan Cikini sudah menumpuk dan menimbulkan bau tidak sedap', 'processing'),
(3, 2, 'Antrian Puskesmas Terlalu Lama', 'Pelayanan di Puskesmas sangat lambat, antrian bisa sampai 3 jam', 'pending');

-- Insert test responses
INSERT INTO responses (complaint_id, admin_id, response_text) VALUES
(2, 1, 'Terima kasih atas laporannya. Tim kebersihan sudah kami kirim ke lokasi untuk membersihkan TPS tersebut.');

-- Show summary
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Complaints', COUNT(*) FROM complaints
UNION ALL
SELECT 'Responses', COUNT(*) FROM responses;
