package database

import (
	"backend/internal/config"
	"backend/internal/models"
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect initializes database connection
func Connect(cfg *config.DatabaseConfig) error {
	var err error
	dsn := cfg.GetDSN()

	// Set logger level based on environment
	logLevel := logger.Info
	if config.AppConfig.Server.Env == "production" {
		logLevel = logger.Error
	}

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✅ Database connected successfully")

	// Auto migrate tables
	if err := AutoMigrate(); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	return nil
}

// AutoMigrate runs database migrations
func AutoMigrate() error {
	log.Println("🔄 Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Complaint{},
		&models.Response{},
	)

	if err != nil {
		return err
	}

	log.Println("✅ Database migrations completed")
	return nil
}

// GetDB returns database instance
func GetDB() *gorm.DB {
	return DB
}
