package handlers

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService service.CategoryService
	categoryRepo    repository.CategoryRepository
	complaintRepo   repository.ComplaintRepository
}

func NewCategoryHandler(
	categoryService service.CategoryService,
	categoryRepo repository.CategoryRepository,
	complaintRepo repository.ComplaintRepository,
) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
		categoryRepo:    categoryRepo,
		complaintRepo:   complaintRepo,
	}
}

// GetAllCategories gets all categories
// GET /api/admin/categories
func (h *CategoryHandler) GetAllCategories(c *gin.Context) {
	categories, err := h.categoryService.GetAllCategories()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch categories", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Categories retrieved successfully", categories)
}

// GetCategoryDetail gets category detail with complaint count
// GET /api/admin/categories/:id
func (h *CategoryHandler) GetCategoryDetail(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID", nil)
		return
	}

	category, err := h.categoryService.GetCategoryDetail(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
		return
	}

	response := gin.H{
		"category": category,
	}

	utils.SuccessResponse(c, http.StatusOK, "Category detail retrieved successfully", response)
}

// CreateCategory creates new category
// POST /api/admin/categories
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req models.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	category, err := h.categoryService.CreateCategory(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create category", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Category created successfully", category)
}

// UpdateCategory updates existing category
// PUT /api/admin/categories/:id
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID", nil)
		return
	}

	var req models.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	category, err := h.categoryService.UpdateCategory(uint(id), &req)
	if err != nil {
		if err.Error() == "Category not found" {
			utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update category", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Category updated successfully", category)
}

// DeleteCategory deletes category
// DELETE /api/admin/categories/:id
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category ID", nil)
		return
	}

	if err := h.categoryService.DeleteCategory(uint(id)); err != nil {
		if err.Error() == "Category not found" {
			utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete category", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Category deleted successfully", nil)
}
