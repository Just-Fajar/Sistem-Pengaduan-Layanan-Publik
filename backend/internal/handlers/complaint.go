package handlers

import (
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/service"
	"backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ComplaintHandler struct {
	complaintService service.ComplaintService
	categoryService  service.CategoryService
}

func NewComplaintHandler(complaintService service.ComplaintService, categoryService service.CategoryService) *ComplaintHandler {
	return &ComplaintHandler{
		complaintService: complaintService,
		categoryService:  categoryService,
	}
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

	filename := middleware.GetUploadedFilename(c)
	complaint, err := h.complaintService.CreateComplaint(userID, &req, filename)
	if err != nil {
		if err.Error() == "Category not found" {
			utils.ErrorResponse(c, http.StatusNotFound, "Category not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create complaint", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Complaint created successfully", complaint)
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

	pagination := utils.GetPaginationParams(c)
	status := c.Query("status")

	result, err := h.complaintService.GetMyComplaints(userID, status, pagination)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch complaints", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Complaints retrieved successfully", result)
}

// GetComplaintDetail gets complaint detail by ID
// GET /api/complaints/:id
func (h *ComplaintHandler) GetComplaintDetail(c *gin.Context) {
	idParam := c.Param("id")
	complaintID, err := strconv.Atoi(idParam)
	if err != nil || complaintID <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid complaint ID", nil)
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

	complaint, err := h.complaintService.GetComplaintDetail(uint(complaintID), userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Complaint detail retrieved successfully", complaint)
}

// GetCategories gets all categories
// GET /api/categories
func (h *ComplaintHandler) GetCategories(c *gin.Context) {
	categories, err := h.categoryService.GetAllCategories()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch categories", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Categories retrieved successfully", categories)
}
