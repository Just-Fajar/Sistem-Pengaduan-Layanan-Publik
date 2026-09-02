package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/handlers"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/internal/testutil"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAdminHandler_GetDashboardStats(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	// Seed test data
	user := models.User{Name: "User 1", Email: "user1@test.com", Role: "user", CreatedAt: time.Now()}
	admin := models.User{Name: "Admin", Email: "admin@test.com", Role: "admin", CreatedAt: time.Now()}
	db.Create(&user)
	db.Create(&admin)

	cat1 := testutil.CreateTestCategory(t, db, "Infrastruktur")
	cat2 := testutil.CreateTestCategory(t, db, "Kesehatan")

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
