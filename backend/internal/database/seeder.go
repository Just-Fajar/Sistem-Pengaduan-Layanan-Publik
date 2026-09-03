package database

import (
	"backend/internal/models"
	"log"

	"gorm.io/gorm"
)

// SeedInitialData seeds default categories and initial users if they don't already exist
func SeedInitialData(db *gorm.DB) error {
	// 1. Seed Categories if empty
	var catCount int64
	if err := db.Model(&models.Category{}).Count(&catCount).Error; err != nil {
		return err
	}

	if catCount == 0 {
		log.Println("🌱 Seeding default complaint categories...")
		defaultCategories := []models.Category{
			{
				Name:        "Infrastruktur",
				Description: "Laporan terkait jalan rusak, jembatan, lampu penerangan jalan, drainase, dan fasilitas umum fisik",
			},
			{
				Name:        "Pelayanan Publik",
				Description: "Laporan terkait birokrasi, kelurahan, kecamatan, perizinan, dan administrasi kependudukan",
			},
			{
				Name:        "Kebersihan Lingkungan",
				Description: "Laporan terkait tumpukan sampah, TPS liar, kebersihan taman, dan pencemaran lingkungan",
			},
			{
				Name:        "Keamanan & Ketertiban",
				Description: "Laporan terkait ketertiban umum, kebisingan, dan potensi gangguan keamanan lingkungan",
			},
		}

		for _, cat := range defaultCategories {
			if err := db.Create(&cat).Error; err != nil {
				return err
			}
		}
		log.Println("✅ Default categories seeded successfully")
	}

	// 2. Seed Admin User if not exists
	var adminCount int64
	if err := db.Model(&models.User{}).Where("email = ?", "admin@example.com").Count(&adminCount).Error; err != nil {
		return err
	}

	if adminCount == 0 {
		log.Println("🌱 Seeding default administrator account...")
		adminUser := models.User{
			Name:  "Admin System",
			Email: "admin@example.com",
			Phone: "081234567890",
			Role:  "admin",
		}
		if err := adminUser.HashPassword("password123"); err != nil {
			return err
		}
		if err := db.Create(&adminUser).Error; err != nil {
			return err
		}
		log.Println("✅ Default administrator seeded successfully")
	}

	// 3. Seed Demo User if not exists
	var userCount int64
	if err := db.Model(&models.User{}).Where("email = ?", "john@example.com").Count(&userCount).Error; err != nil {
		return err
	}

	if userCount == 0 {
		log.Println("🌱 Seeding demo user account...")
		demoUser := models.User{
			Name:  "John Doe",
			Email: "john@example.com",
			Phone: "081234567891",
			Role:  "user",
		}
		if err := demoUser.HashPassword("password123"); err != nil {
			return err
		}
		if err := db.Create(&demoUser).Error; err != nil {
			return err
		}
		log.Println("✅ Demo user seeded successfully")
	}

	return nil
}
