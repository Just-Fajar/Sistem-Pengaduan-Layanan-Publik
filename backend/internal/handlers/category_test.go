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

func TestCategoryHandler_CRUD(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	_, adminToken := testutil.CreateTestUser(t, db, "admin")

	categoryRepo := repository.NewCategoryRepository(db)
	complaintRepo := repository.NewComplaintRepository(db)
	categoryService := service.NewCategoryService(categoryRepo)
	categoryHandler := handlers.NewCategoryHandler(categoryService, categoryRepo, complaintRepo)

	r := gin.New()
	r.Use(middleware.AuthMiddleware())
	r.Use(middleware.AdminMiddleware())

	r.GET("/api/admin/categories", categoryHandler.GetAllCategories)
	r.POST("/api/admin/categories", categoryHandler.CreateCategory)
	r.GET("/api/admin/categories/:id", categoryHandler.GetCategoryDetail)
	r.PUT("/api/admin/categories/:id", categoryHandler.UpdateCategory)
	r.DELETE("/api/admin/categories/:id", categoryHandler.DeleteCategory)

	// 1. Create Category
	createReq := models.CreateCategoryRequest{
		Name:        "Sosial",
		Description: "Bantuan dan masalah sosial",
	}
	bodyBytes, _ := json.Marshal(createReq)
	reqCreate, _ := http.NewRequest(http.MethodPost, "/api/admin/categories", bytes.NewBuffer(bodyBytes))
	reqCreate.Header.Set("Authorization", "Bearer "+adminToken)
	reqCreate.Header.Set("Content-Type", "application/json")
	wCreate := httptest.NewRecorder()
	r.ServeHTTP(wCreate, reqCreate)

	assert.Equal(t, http.StatusCreated, wCreate.Code)

	var resCreate utils.Response
	err := json.Unmarshal(wCreate.Body.Bytes(), &resCreate)
	assert.NoError(t, err)

	// 2. Get All Categories
	reqList, _ := http.NewRequest(http.MethodGet, "/api/admin/categories", nil)
	reqList.Header.Set("Authorization", "Bearer "+adminToken)
	wList := httptest.NewRecorder()
	r.ServeHTTP(wList, reqList)

	assert.Equal(t, http.StatusOK, wList.Code)

	// 3. Update Category
	updateReq := models.UpdateCategoryRequest{
		Name:        "Sosial & Kesejahteraan",
		Description: "Bantuan sosial terpadu",
	}
	updateBytes, _ := json.Marshal(updateReq)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/admin/categories/1", bytes.NewBuffer(updateBytes))
	reqUpdate.Header.Set("Authorization", "Bearer "+adminToken)
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)

	assert.Equal(t, http.StatusOK, wUpdate.Code)

	// 4. Delete Category
	reqDel, _ := http.NewRequest(http.MethodDelete, "/api/admin/categories/1", nil)
	reqDel.Header.Set("Authorization", "Bearer "+adminToken)
	wDel := httptest.NewRecorder()
	r.ServeHTTP(wDel, reqDel)

	assert.Equal(t, http.StatusOK, wDel.Code)
}
