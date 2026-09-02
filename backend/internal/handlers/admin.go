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

type AdminHandler struct {
	adminService service.AdminService
}

func NewAdminHandler(adminService service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// GetDashboardStats gets dashboard statistics
// GET /api/admin/statistics
func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.adminService.GetDashboardStats()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch statistics", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Statistics retrieved successfully", stats)
}

// GetAllComplaints gets all complaints with filters and pagination
// GET /api/admin/complaints
func (h *AdminHandler) GetAllComplaints(c *gin.Context) {
	pagination := utils.GetPaginationParams(c)

	filters := repository.ComplaintFilter{
		Status:     c.Query("status"),
		CategoryID: c.Query("category_id"),
		Search:     c.Query("search"),
		DateFrom:   c.Query("date_from"),
		DateTo:     c.Query("date_to"),
	}

	result, err := h.adminService.GetAllComplaints(filters, pagination)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch complaints", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Complaints retrieved successfully", result)
}

// GetComplaintDetail gets complaint detail by ID (Admin can see all)
// GET /api/admin/complaints/:id
func (h *AdminHandler) GetComplaintDetail(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid complaint ID", nil)
		return
	}

	complaint, err := h.adminService.GetComplaintDetail(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Complaint detail retrieved successfully", complaint)
}

// UpdateComplaintStatus updates complaint status
// PUT /api/admin/complaints/:id/status
func (h *AdminHandler) UpdateComplaintStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid complaint ID", nil)
		return
	}

	var req models.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	complaint, err := h.adminService.UpdateComplaintStatus(uint(id), req.Status)
	if err != nil {
		if err.Error() == "Complaint not found" {
			utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update status", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Status updated successfully", complaint)
}

// AddResponse adds admin response to complaint
// POST /api/admin/complaints/:id/response
func (h *AdminHandler) AddResponse(c *gin.Context) {
	idParam := c.Param("id")
	complaintID, err := strconv.Atoi(idParam)
	if err != nil || complaintID <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid complaint ID", nil)
		return
	}

	adminIDRaw, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	adminID, ok := adminIDRaw.(uint)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid admin context", nil)
		return
	}

	var req models.CreateResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	response, err := h.adminService.AddResponse(uint(complaintID), adminID, req.ResponseText)
	if err != nil {
		if err.Error() == "Complaint not found" {
			utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create response", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Response added successfully", response)
}
