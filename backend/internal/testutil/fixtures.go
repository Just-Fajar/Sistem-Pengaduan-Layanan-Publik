package testutil

import (
	"backend/internal/models"
	"backend/internal/utils"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// CreateTestUser creates a test user with hashed password and generates a valid JWT token
func CreateTestUser(t *testing.T, db *gorm.DB, role string) (*models.User, string) {
	uniqueID := time.Now().UnixNano()
	user := models.User{
		Name:  fmt.Sprintf("User %d", uniqueID%10000),
		Email: fmt.Sprintf("user_%d@test.com", uniqueID),
		Phone: "081234567890",
		Role:  role,
	}
	err := user.HashPassword("password123")
	assert.NoError(t, err)

	err = db.Create(&user).Error
	assert.NoError(t, err)

	token, err := utils.GenerateToken(&user)
	assert.NoError(t, err)

	return &user, token
}

// CreateTestCategory creates a test category
func CreateTestCategory(t *testing.T, db *gorm.DB, name string) *models.Category {
	category := models.Category{
		Name:        name,
		Description: fmt.Sprintf("Deskripsi kategori %s", name),
	}
	err := db.Create(&category).Error
	assert.NoError(t, err)
	return &category
}

// CreateTestComplaint creates a test complaint
func CreateTestComplaint(t *testing.T, db *gorm.DB, userID, categoryID uint, title string, status models.ComplaintStatus) *models.Complaint {
	complaint := models.Complaint{
		UserID:      userID,
		CategoryID:  categoryID,
		Title:       title,
		Description: "Deskripsi pengaduan pengujian sistem",
		Status:      status,
	}
	err := db.Create(&complaint).Error
	assert.NoError(t, err)
	return &complaint
}
