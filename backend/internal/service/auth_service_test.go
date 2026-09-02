package service_test

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"path/filepath"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	dbPath := filepath.Join(t.TempDir(), "service_test.db")
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

func TestAuthService_RegisterAndLogin(t *testing.T) {
	db := setupTestDB(t)
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo)

	// White-Box: Test Register
	regReq := models.UserRegisterRequest{
		Name:     "Siti Aminah",
		Email:    "siti@example.com",
		Password: "password123",
		Phone:    "081234567890",
	}

	userRes, token, err := authService.Register(&regReq)
	assert.NoError(t, err)
	assert.NotNil(t, userRes)
	assert.NotEmpty(t, token)
	assert.Equal(t, "Siti Aminah", userRes.Name)
	assert.Equal(t, "siti@example.com", userRes.Email)

	// White-Box: Duplicate Email Registration must fail
	_, _, err = authService.Register(&regReq)
	assert.Error(t, err)
	assert.Equal(t, "Email already registered", err.Error())

	// White-Box: Login with correct password
	loginReq := models.UserLoginRequest{
		Email:    "siti@example.com",
		Password: "password123",
	}
	loginRes, loginToken, err := authService.Login(&loginReq)
	assert.NoError(t, err)
	assert.NotNil(t, loginRes)
	assert.NotEmpty(t, loginToken)

	// White-Box: Login with incorrect password
	badLoginReq := models.UserLoginRequest{
		Email:    "siti@example.com",
		Password: "wrongpassword",
	}
	_, _, err = authService.Login(&badLoginReq)
	assert.Error(t, err)
	assert.Equal(t, "Invalid email or password", err.Error())
}

func TestCategoryService_CRUD(t *testing.T) {
	db := setupTestDB(t)
	categoryRepo := repository.NewCategoryRepository(db)
	categoryService := service.NewCategoryService(categoryRepo)

	// Create
	cat, err := categoryService.CreateCategory(&models.CreateCategoryRequest{
		Name:        "Pelayanan Publik",
		Description: "Layanan kantor kelurahan",
	})
	assert.NoError(t, err)
	assert.Equal(t, "Pelayanan Publik", cat.Name)

	// Read
	detail, err := categoryService.GetCategoryDetail(cat.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Pelayanan Publik", detail.Name)

	// Update
	updated, err := categoryService.UpdateCategory(cat.ID, &models.UpdateCategoryRequest{
		Name:        "Pelayanan Publik Terpadu",
		Description: "Layanan kantor terpadu",
	})
	assert.NoError(t, err)
	assert.Equal(t, "Pelayanan Publik Terpadu", updated.Name)

	// Delete
	err = categoryService.DeleteCategory(cat.ID)
	assert.NoError(t, err)

	// Verify not found after delete
	_, err = categoryService.GetCategoryDetail(cat.ID)
	assert.Error(t, err)
}
