-- Database Setup Script
-- Sistem Pengaduan Layanan Publik
-- Run this script to create database and all tables

-- Create database
CREATE DATABASE IF NOT EXISTS pengaduan_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE pengaduan_db;

-- Run migrations in order
SOURCE 001_create_users_table.sql;
SOURCE 002_create_categories_table.sql;
SOURCE 003_create_complaints_table.sql;
SOURCE 004_create_responses_table.sql;

-- Show all tables
SHOW TABLES;
