package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"

	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
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

func TestAdminHandler_GetDashboardStats(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)

	// Seed test data
	user := models.User{Name: "User 1", Email: "user1@test.com", Role: "user", CreatedAt: time.Now()}
	admin := models.User{Name: "Admin", Email: "admin@test.com", Role: "admin", CreatedAt: time.Now()}
	db.Create(&user)
	db.Create(&admin)

	cat1 := models.Category{Name: "Infrastruktur", Description: "Jalan rusak"}
	cat2 := models.Category{Name: "Kesehatan", Description: "Layanan RS"}
	db.Create(&cat1)
	db.Create(&cat2)

	// Create complaints with different categories and statuses
	c1 := models.Complaint{UserID: user.ID, CategoryID: cat1.ID, Title: "Jalan Berlubang", Status: "pending"}
	c2 := models.Complaint{UserID: user.ID, CategoryID: cat1.ID, Title: "Jembatan Rusak", Status: "processing"}
	c3 := models.Complaint{UserID: user.ID, CategoryID: cat2.ID, Title: "Antrian Lama", Status: "completed"}
	db.Create(&c1)
	db.Create(&c2)
	db.Create(&c3)

	userRepo := repository.NewUserRepository(db)
	complaintRepo := repository.NewComplaintRepository(db)
	responseRepo := repository.NewResponseRepository(db)
	adminService := service.NewAdminService(complaintRepo, userRepo, responseRepo)
	adminHandler := handlers.NewAdminHandler(adminService)

	r := gin.New()
	r.GET("/api/admin/statistics", adminHandler.GetDashboardStats)

	// Black-Box: HTTP Request to /api/admin/statistics
	req, _ := http.NewRequest(http.MethodGet, "/api/admin/statistics", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Assert Status Code
	assert.Equal(t, http.StatusOK, w.Code)

	// Parse Response Envelope
	var response utils.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.True(t, response.Success)

	// White-Box / Grey-Box: Assert Statistics Payload
	dataMap, ok := response.Data.(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, float64(3), dataMap["total_complaints"])
	assert.Equal(t, float64(1), dataMap["pending_complaints"])
	assert.Equal(t, float64(1), dataMap["processing_complaints"])
	assert.Equal(t, float64(1), dataMap["completed_complaints"])
	assert.Equal(t, float64(1), dataMap["total_users"]) // only user role

	// Check complaints_by_category array
	categoryStats, exists := dataMap["complaints_by_category"].([]interface{})
	assert.True(t, exists)
	assert.Equal(t, 2, len(categoryStats))
}
