package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct{}

func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{}
}

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description"`
}

// GetAllCategories gets all categories
// GET /api/admin/categories
func (h *CategoryHandler) GetAllCategories(c *gin.Context) {
	var categories []models.Category
	if err := database.DB.Find(&categories).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch categories", err.Error())
		return
	}

	responses := make([]models.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = category.ToCategoryResponse()
	}

	utils.SuccessResponse(c, http.StatusOK, "Categories retrieved successfully", responses)
}

// GetCategoryDetail gets category detail with complaint count
// GET /api/admin/categories/:id
func (h *CategoryHandler) GetCategoryDetail(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.Category
	if err := database.DB.First(&category, categoryID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
		return
	}

	// Count complaints
	var complaintCount int64
	database.DB.Model(&models.Complaint{}).Where("category_id = ?", categoryID).Count(&complaintCount)

	response := gin.H{
		"category":        category.ToCategoryResponse(),
		"complaint_count": complaintCount,
	}

	utils.SuccessResponse(c, http.StatusOK, "Category detail retrieved successfully", response)
}

// CreateCategory creates new category
// POST /api/admin/categories
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	// Check if category name exists
	var existingCategory models.Category
	if err := database.DB.Where("name = ?", req.Name).First(&existingCategory).Error; err == nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Category name already exists", nil)
		return
	}

	category := models.Category{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := database.DB.Create(&category).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create category", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Category created successfully", category.ToCategoryResponse())
}

// UpdateCategory updates existing category
// PUT /api/admin/categories/:id
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	var category models.Category
	if err := database.DB.First(&category, categoryID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
		return
	}

	// Check if name is taken by another category
	var existingCategory models.Category
	if err := database.DB.Where("name = ? AND id != ?", req.Name, categoryID).First(&existingCategory).Error; err == nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Category name already exists", nil)
		return
	}

	category.Name = req.Name
	category.Description = req.Description

	if err := database.DB.Save(&category).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update category", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Category updated successfully", category.ToCategoryResponse())
}

// DeleteCategory deletes category
// DELETE /api/admin/categories/:id
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.Category
	if err := database.DB.First(&category, categoryID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
		return
	}

	// Check if category has complaints
	var complaintCount int64
	database.DB.Model(&models.Complaint{}).Where("category_id = ?", categoryID).Count(&complaintCount)

	if complaintCount > 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Cannot delete category with existing complaints", nil)
		return
	}

	if err := database.DB.Delete(&category).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete category", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Category deleted successfully", nil)
}
