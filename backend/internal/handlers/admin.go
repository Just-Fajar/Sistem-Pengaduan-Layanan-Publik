package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// GetAllComplaints gets all complaints with filters
// GET /api/admin/complaints
func (h *AdminHandler) GetAllComplaints(c *gin.Context) {
	// Get pagination params
	params := utils.GetPaginationParams(c)
	
	status := c.Query("status")
	categoryID := c.Query("category_id")
	search := c.Query("search")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	query := database.DB.Preload("User").
		Preload("Category").
		Preload("Responses.Admin").
		Order("created_at desc")

	// Apply filters
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if search != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if dateFrom != "" {
		query = query.Where("created_at >= ?", dateFrom)
	}

	if dateTo != "" {
		query = query.Where("created_at <= ?", dateTo)
	}

	// Count total
	var totalRows int64
	query.Model(&models.Complaint{}).Count(&totalRows)

	// Get paginated results
	var complaints []models.Complaint
	if err := query.Scopes(utils.Paginate(params)).Find(&complaints).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch complaints", err.Error())
		return
	}

	// Convert to response format
	responses := make([]models.ComplaintResponse, len(complaints))
	for i, complaint := range complaints {
		responses[i] = complaint.ToComplaintResponse()
	}

	// Build pagination result
	result := utils.BuildPaginationResult(params.Page, params.PageSize, totalRows, responses)
	utils.SuccessResponse(c, http.StatusOK, "Complaints retrieved successfully", result)
}

// GetComplaintDetail gets complaint detail (admin can see all)
// GET /api/admin/complaints/:id
func (h *AdminHandler) GetComplaintDetail(c *gin.Context) {
	complaintID := c.Param("id")

	var complaint models.Complaint
	if err := database.DB.Preload("User").
		Preload("Category").
		Preload("Responses.Admin").
		First(&complaint, complaintID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Complaint detail retrieved successfully", complaint.ToComplaintResponse())
}

// UpdateComplaintStatus updates complaint status
// PUT /api/admin/complaints/:id/status
func (h *AdminHandler) UpdateComplaintStatus(c *gin.Context) {
	complaintID := c.Param("id")

	var req models.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	// Find complaint
	var complaint models.Complaint
	if err := database.DB.First(&complaint, complaintID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	// Store old status for email
	oldStatus := string(complaint.Status)
	
	// Update status
	complaint.Status = req.Status
	if err := database.DB.Save(&complaint).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update status", err.Error())
		return
	}

	// Load relations
	database.DB.Preload("User").Preload("Category").Preload("Responses.Admin").First(&complaint, complaint.ID)

	// Send email notification
	if complaint.User.Email != "" {
		emailService := utils.NewEmailService()
		go emailService.SendStatusUpdateNotification(
			complaint.User.Email,
			complaint.User.Name,
			complaint.Title,
			oldStatus,
			string(req.Status),
		)
	}

	utils.SuccessResponse(c, http.StatusOK, "Status updated successfully", complaint.ToComplaintResponse())
}

// AddResponse adds admin response to complaint
// POST /api/admin/complaints/:id/response
func (h *AdminHandler) AddResponse(c *gin.Context) {
	complaintID := c.Param("id")
	adminID, _ := c.Get("user_id")

	var req models.CreateResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	// Check if complaint exists
	var complaint models.Complaint
	if err := database.DB.First(&complaint, complaintID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	// Create response
	response := models.Response{
		ComplaintID:  complaint.ID,
		AdminID:      adminID.(uint),
		ResponseText: req.ResponseText,
	}

	if err := database.DB.Create(&response).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create response", err.Error())
		return
	}

	// Load admin info and complaint with user
	database.DB.Preload("Admin").First(&response, response.ID)
	database.DB.Preload("User").First(&complaint, complaint.ID)

	// Send email notification
	if complaint.User.Email != "" {
		emailService := utils.NewEmailService()
		go emailService.SendResponseNotification(
			complaint.User.Email,
			complaint.User.Name,
			complaint.Title,
			req.ResponseText,
		)
	}

	utils.SuccessResponse(c, http.StatusCreated, "Response added successfully", response.ToResponseItem())
}

// GetDashboardStats gets dashboard statistics
// GET /api/admin/statistics
func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	var stats struct {
		TotalComplaints     int64 `json:"total_complaints"`
		PendingComplaints   int64 `json:"pending_complaints"`
		ProcessingComplaints int64 `json:"processing_complaints"`
		CompletedComplaints int64 `json:"completed_complaints"`
		TotalUsers          int64 `json:"total_users"`
	}

	database.DB.Model(&models.Complaint{}).Count(&stats.TotalComplaints)
	database.DB.Model(&models.Complaint{}).Where("status = ?", "pending").Count(&stats.PendingComplaints)
	database.DB.Model(&models.Complaint{}).Where("status = ?", "processing").Count(&stats.ProcessingComplaints)
	database.DB.Model(&models.Complaint{}).Where("status = ?", "completed").Count(&stats.CompletedComplaints)
	database.DB.Model(&models.User{}).Where("role = ?", "user").Count(&stats.TotalUsers)

	utils.SuccessResponse(c, http.StatusOK, "Statistics retrieved successfully", stats)
}
