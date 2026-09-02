package handlers

import (
	"backend/internal/repository"
	"backend/internal/utils"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type ExportHandler struct {
	complaintRepo repository.ComplaintRepository
}

func NewExportHandler(complaintRepo repository.ComplaintRepository) *ExportHandler {
	return &ExportHandler{complaintRepo: complaintRepo}
}

// ExportComplaintsToPDF exports complaints list to PDF
// GET /api/admin/export/complaints/pdf
func (h *ExportHandler) ExportComplaintsToPDF(c *gin.Context) {
	filters := repository.ComplaintFilter{
		Status:     c.Query("status"),
		CategoryID: c.Query("category_id"),
	}

	complaints, err := h.complaintRepo.FindAllWithoutPagination(filters)
	if err != nil {
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
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid complaint ID", nil)
		return
	}

	complaint, err := h.complaintRepo.FindByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Complaint not found", nil)
		return
	}

	// Generate PDF
	exporter := utils.NewPDFExporter()
	timestamp := time.Now().Format("20060102_150405")
	filename := filepath.Join("uploads", fmt.Sprintf("complaint_%s_%s.pdf", idParam, timestamp))

	if err := exporter.ExportComplaintDetailToPDF(*complaint, filename); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate PDF", err.Error())
		return
	}

	// Send file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=complaint_%s.pdf", idParam))
	c.File(filename)

	// Delete file after sending
	go func() {
		time.Sleep(5 * time.Second)
		os.Remove(filename)
	}()
}
