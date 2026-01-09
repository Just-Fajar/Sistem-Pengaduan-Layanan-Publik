package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/utils"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

type ExportHandler struct{}

func NewExportHandler() *ExportHandler {
	return &ExportHandler{}
}

// ExportComplaintsToPDF exports complaints list to PDF
// GET /api/admin/export/complaints/pdf
func (h *ExportHandler) ExportComplaintsToPDF(c *gin.Context) {
	status := c.Query("status")
	categoryID := c.Query("category_id")

	query := database.DB.Preload("Category").Preload("User").Order("created_at desc")

	// Apply filters
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	var complaints []models.Complaint
	if err := query.Find(&complaints).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch complaints", err.Error())
		return
	}

	// Generate PDF
	exporter := utils.NewPDFExporter()
	timestamp := time.Now().Format("20060102_150405")
	filename := filepath.Join("uploads", fmt.Sprintf("complaints_%s.pdf", timestamp))

	if err := exporter.ExportComplaintsToPDF(complaints, filename); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate PDF", err.Error())
		return
	}

	// Send file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=complaints_%s.pdf", timestamp))
	c.File(filename)

	// Delete file after sending
	go func() {
		time.Sleep(5 * time.Second)
		os.Remove(filename)
	}()
}

// ExportComplaintDetailToPDF exports single complaint to PDF
// GET /api/admin/export/complaints/:id/pdf
func (h *ExportHandler) ExportComplaintDetailToPDF(c *gin.Context) {
	complaintID := c.Param("id")

	var complaint models.Complaint
	if err := database.DB.Preload("User").
		Preload("Category").
		Preload("Responses.Admin").
		First(&complaint, complaintID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	// Generate PDF
	exporter := utils.NewPDFExporter()
	timestamp := time.Now().Format("20060102_150405")
	filename := filepath.Join("uploads", fmt.Sprintf("complaint_%s_%s.pdf", complaintID, timestamp))

	if err := exporter.ExportComplaintDetailToPDF(complaint, filename); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate PDF", err.Error())
		return
	}

	// Send file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=complaint_%s.pdf", complaintID))
	c.File(filename)

	// Delete file after sending
	go func() {
		time.Sleep(5 * time.Second)
		os.Remove(filename)
	}()
}
