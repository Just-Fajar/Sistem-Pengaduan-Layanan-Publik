package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ComplaintHandler struct{}

func NewComplaintHandler() *ComplaintHandler {
	return &ComplaintHandler{}
}

// CreateComplaint creates a new complaint
// POST /api/complaints
func (h *ComplaintHandler) CreateComplaint(c *gin.Context) {
	var req models.CreateComplaintRequest

	if err := c.ShouldBind(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user context", nil)
		return
	}

	// Check if category exists
	var category models.Category
	if err := database.DB.First(&category, req.CategoryID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
		return
	}

	// Create complaint
	complaint := models.Complaint{
		UserID:      userID,
		CategoryID:  req.CategoryID,
		Title:       req.Title,
		Description: req.Description,
		Status:      models.StatusPending,
	}

	// Get uploaded photo if exists
	if filename := middleware.GetUploadedFilename(c); filename != "" {
		complaint.PhotoURL = fmt.Sprintf("/uploads/%s", filename)
	}

	// Save to database
	if err := database.DB.Create(&complaint).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create complaint", err.Error())
		return
	}

	// Load relations
	database.DB.Preload("User").Preload("Category").First(&complaint, complaint.ID)

	utils.SuccessResponse(c, http.StatusCreated, "Complaint created successfully", complaint.ToComplaintResponse())
}

// GetMyComplaints gets all complaints for current user
// GET /api/complaints
func (h *ComplaintHandler) GetMyComplaints(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user context", nil)
		return
	}
	
	// Get pagination params
	pagination := utils.GetPaginationParams(c)

	// Build query
	query := database.DB.Model(&models.Complaint{}).
		Where("user_id = ?", userID).
		Preload("Category").
		Preload("Responses")

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total rows
	var totalRows int64
	query.Count(&totalRows)

	// Get complaints with pagination
	var complaints []models.Complaint
	if err := query.Scopes(utils.Paginate(pagination)).Order("created_at DESC").Find(&complaints).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch complaints", err.Error())
		return
	}

	// Convert to response format
	responses := make([]models.ComplaintResponse, len(complaints))
	for i, complaint := range complaints {
		responses[i] = complaint.ToComplaintResponse()
	}

	result := utils.BuildPaginationResult(pagination.Page, pagination.PageSize, totalRows, responses)
	utils.SuccessResponse(c, http.StatusOK, "Complaints retrieved successfully", result)
}

// GetComplaintDetail gets complaint detail by ID
// GET /api/complaints/:id
func (h *ComplaintHandler) GetComplaintDetail(c *gin.Context) {
	complaintID := c.Param("id")
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user context", nil)
		return
	}

	var complaint models.Complaint
	query := database.DB.Preload("User").
		Preload("Category").
		Preload("Responses.Admin")

	// User can only see their own complaints
	query = query.Where("id = ? AND user_id = ?", complaintID, userID)

	if err := query.First(&complaint).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Complaint detail retrieved successfully", complaint.ToComplaintResponse())
}

// GetCategories gets all categories
// GET /api/categories
func (h *ComplaintHandler) GetCategories(c *gin.Context) {
	var categories []models.Category

	if err := database.DB.Find(&categories).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch categories", err.Error())
		return
	}

	// Convert to response format
	responses := make([]models.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = category.ToCategoryResponse()
	}

	utils.SuccessResponse(c, http.StatusOK, "Categories retrieved successfully", responses)
}
