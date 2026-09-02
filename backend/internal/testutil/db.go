package testutil

import (
	"backend/internal/database"
	"backend/internal/models"
	"path/filepath"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// SetupTestDB initializes a clean, in-memory SQLite database for testing with auto-cleanup
func SetupTestDB(t *testing.T) *gorm.DB {
	dbPath := filepath.Join(t.TempDir(), "test.db")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	assert.NoError(t, err)

	sqlDB, err := db.DB()
	if err == nil {
		t.Cleanup(func() {
			_ = sqlDB.Close()
		})
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Complaint{},
		&models.Response{},
	)
	assert.NoError(t, err)

	database.DB = db
	return db
}
