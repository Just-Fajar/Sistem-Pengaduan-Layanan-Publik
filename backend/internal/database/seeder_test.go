package database_test

import (
	"backend/internal/database"
	"backend/internal/models"
	"path/filepath"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	dbPath := filepath.Join(t.TempDir(), "seeder_test.db")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	assert.NoError(t, err)

	sqlDB, err := db.DB()
	if err == nil {
		t.Cleanup(func() {
			_ = sqlDB.Close()
		})
	}

	err = db.AutoMigrate(&models.User{}, &models.Category{}, &models.Complaint{}, &models.Response{})
	assert.NoError(t, err)

	return db
}

func TestSeedInitialData(t *testing.T) {
	db := setupTestDB(t)

	// 1. First execution: should seed 4 categories and 2 users
	err := database.SeedInitialData(db)
	assert.NoError(t, err)

	var catCount int64
	db.Model(&models.Category{}).Count(&catCount)
	assert.Equal(t, int64(4), catCount)

	var admin models.User
	err = db.Where("email = ?", "admin@example.com").First(&admin).Error
	assert.NoError(t, err)
	assert.Equal(t, "admin", admin.Role)
	assert.NoError(t, admin.CheckPassword("password123"))

	var user models.User
	err = db.Where("email = ?", "john@example.com").First(&user).Error
	assert.NoError(t, err)
	assert.Equal(t, "user", user.Role)
	assert.NoError(t, user.CheckPassword("password123"))

	// 2. Second execution: idempotent, counts must not change
	err = database.SeedInitialData(db)
	assert.NoError(t, err)

	var catCountAfter int64
	db.Model(&models.Category{}).Count(&catCountAfter)
	assert.Equal(t, int64(4), catCountAfter)

	var userCountAfter int64
	db.Model(&models.User{}).Count(&userCountAfter)
	assert.Equal(t, int64(2), userCountAfter)
}
