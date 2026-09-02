package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/internal/testutil"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestComplaintHandler_CreateAndGet(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	user, token := testutil.CreateTestUser(t, db, "user")
	category := testutil.CreateTestCategory(t, db, "Lingkungan")

	complaintRepo := repository.NewComplaintRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	complaintService := service.NewComplaintService(complaintRepo, categoryRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	complaintHandler := handlers.NewComplaintHandler(complaintService, categoryService)

	r := gin.New()
	r.Use(middleware.AuthMiddleware())
	r.POST("/api/complaints", complaintHandler.CreateComplaint)
	r.GET("/api/complaints", complaintHandler.GetMyComplaints)
	r.GET("/api/complaints/:id", complaintHandler.GetComplaintDetail)
	r.GET("/api/categories", complaintHandler.GetCategories)

	// 1. Black-Box / White-Box: Create Complaint
	createReq := models.CreateComplaintRequest{
		CategoryID:  category.ID,
		Title:       "Pohon Tumbang Menutup Jalan",
		Description: "Pohon tumbang di jalan melati akibat hujan deras",
	}
	bodyBytes, _ := json.Marshal(createReq)
	reqCreate, _ := http.NewRequest(http.MethodPost, "/api/complaints", bytes.NewBuffer(bodyBytes))
	reqCreate.Header.Set("Authorization", "Bearer "+token)
	reqCreate.Header.Set("Content-Type", "application/json")
	wCreate := httptest.NewRecorder()
	r.ServeHTTP(wCreate, reqCreate)

	assert.Equal(t, http.StatusCreated, wCreate.Code)

	var resCreate utils.Response
	err := json.Unmarshal(wCreate.Body.Bytes(), &resCreate)
	assert.NoError(t, err)
	assert.True(t, resCreate.Success)

	// 2. Black-Box: Get My Complaints List
	reqList, _ := http.NewRequest(http.MethodGet, "/api/complaints?page=1&page_size=10", nil)
	reqList.Header.Set("Authorization", "Bearer "+token)
	wList := httptest.NewRecorder()
	r.ServeHTTP(wList, reqList)

	assert.Equal(t, http.StatusOK, wList.Code)

	// 3. Black-Box: Get Categories (Public for authenticated users)
	reqCat, _ := http.NewRequest(http.MethodGet, "/api/categories", nil)
	reqCat.Header.Set("Authorization", "Bearer "+token)
	wCat := httptest.NewRecorder()
	r.ServeHTTP(wCat, reqCat)

	assert.Equal(t, http.StatusOK, wCat.Code)

	// 4. Black-Box: Get Single Complaint Detail
	complaint := testutil.CreateTestComplaint(t, db, user.ID, category.ID, "Lampu Jalan Mati", models.StatusPending)
	reqDetail, _ := http.NewRequest(http.MethodGet, "/api/complaints/1", nil)
	reqDetail.Header.Set("Authorization", "Bearer "+token)
	wDetail := httptest.NewRecorder()
	r.ServeHTTP(wDetail, reqDetail)

	assert.Equal(t, http.StatusOK, wDetail.Code)
	assert.NotNil(t, complaint)
}
