package utils

import (
	"backend/internal/models"
	"fmt"
	"time"

	"github.com/jung-kurt/gofpdf"
)

type PDFExporter struct{}

func NewPDFExporter() *PDFExporter {
	return &PDFExporter{}
}

// cleanPDFText ensures text is safely encodable in standard PDF Latin-1 font
func cleanPDFText(s string) string {
	var result []rune
	for _, r := range s {
		if (r >= 32 && r <= 255) || r == '\n' || r == '\r' || r == '\t' {
			result = append(result, r)
		} else if r > 255 {
			result = append(result, '?')
		}
	}
	return string(result)
}

func (e *PDFExporter) ExportComplaintsToPDF(complaints []models.Complaint, filename string) error {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Header
	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(190, 10, "Laporan Pengaduan Layanan Publik", "", 1, "C", false, 0, "")
	pdf.Ln(5)

	// Date
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(190, 6, "Tanggal: "+time.Now().Format("02 January 2006"), "", 1, "R", false, 0, "")
	pdf.Ln(5)

	// Table Header
	pdf.SetFont("Arial", "B", 10)
	pdf.SetFillColor(59, 130, 246)
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(15, 8, "ID", "1", 0, "C", true, 0, "")
	pdf.CellFormat(60, 8, "Judul", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 8, "Kategori", "1", 0, "C", true, 0, "")
	pdf.CellFormat(30, 8, "Status", "1", 0, "C", true, 0, "")
	pdf.CellFormat(45, 8, "Tanggal", "1", 1, "C", true, 0, "")

	// Table Body
	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFillColor(245, 245, 245)

	for i, complaint := range complaints {
		fill := i%2 == 0
		pdf.CellFormat(15, 7, fmt.Sprintf("%d", complaint.ID), "1", 0, "C", fill, 0, "")
		
		// Truncate and clean title
		title := cleanPDFText(complaint.Title)
		if len(title) > 40 {
			title = title[:37] + "..."
		}
		pdf.CellFormat(60, 7, title, "1", 0, "L", fill, 0, "")
		
		categoryName := ""
		if complaint.Category.ID != 0 {
			categoryName = cleanPDFText(complaint.Category.Name)
		}
		pdf.CellFormat(40, 7, categoryName, "1", 0, "L", fill, 0, "")
		pdf.CellFormat(30, 7, string(complaint.Status), "1", 0, "C", fill, 0, "")
		pdf.CellFormat(45, 7, complaint.CreatedAt.Format("02/01/2006 15:04"), "1", 1, "C", fill, 0, "")
	}

	// Summary
	pdf.Ln(5)
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(190, 6, fmt.Sprintf("Total Pengaduan: %d", len(complaints)), "", 1, "L", false, 0, "")

	return pdf.OutputFileAndClose(filename)
}

func (e *PDFExporter) ExportComplaintDetailToPDF(complaint models.Complaint, filename string) error {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Header
	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(190, 10, "Detail Pengaduan", "", 1, "C", false, 0, "")
	pdf.Ln(5)

	// Complaint Info
	pdf.SetFont("Arial", "B", 11)
	pdf.Cell(40, 7, "ID Pengaduan:")
	pdf.SetFont("Arial", "", 11)
	pdf.Cell(0, 7, fmt.Sprintf("#%d", complaint.ID))
	pdf.Ln(7)

	pdf.SetFont("Arial", "B", 11)
	pdf.Cell(40, 7, "Judul:")
	pdf.SetFont("Arial", "", 11)
	pdf.MultiCell(0, 7, complaint.Title, "", "L", false)
	pdf.Ln(2)

	pdf.SetFont("Arial", "B", 11)
	pdf.Cell(40, 7, "Kategori:")
	pdf.SetFont("Arial", "", 11)
	pdf.Cell(0, 7, complaint.Category.Name)
	pdf.Ln(7)

	pdf.SetFont("Arial", "B", 11)
	pdf.Cell(40, 7, "Status:")
	pdf.SetFont("Arial", "", 11)
	pdf.Cell(0, 7, string(complaint.Status))
	pdf.Ln(7)

	pdf.SetFont("Arial", "B", 11)
	pdf.Cell(40, 7, "Tanggal:")
	pdf.SetFont("Arial", "", 11)
	pdf.Cell(0, 7, complaint.CreatedAt.Format("02 January 2006, 15:04"))
	pdf.Ln(10)

	// Description
	pdf.SetFont("Arial", "B", 11)
	pdf.Cell(0, 7, "Deskripsi:")
	pdf.Ln(7)
	pdf.SetFont("Arial", "", 10)
	pdf.MultiCell(0, 6, complaint.Description, "", "L", false)
	pdf.Ln(5)

	// User Info
	if complaint.User.ID != 0 {
		pdf.SetFont("Arial", "B", 11)
		pdf.Cell(0, 7, "Informasi Pelapor:")
		pdf.Ln(7)
		pdf.SetFont("Arial", "", 10)
		pdf.Cell(40, 6, "Nama:")
		pdf.Cell(0, 6, complaint.User.Name)
		pdf.Ln(6)
		pdf.Cell(40, 6, "Email:")
		pdf.Cell(0, 6, complaint.User.Email)
		pdf.Ln(6)
		if complaint.User.Phone != "" {
			pdf.Cell(40, 6, "Telepon:")
			pdf.Cell(0, 6, complaint.User.Phone)
			pdf.Ln(6)
		}
		pdf.Ln(5)
	}

	// Responses
	if len(complaint.Responses) > 0 {
		pdf.SetFont("Arial", "B", 11)
		pdf.Cell(0, 7, fmt.Sprintf("Tanggapan Admin (%d):", len(complaint.Responses)))
		pdf.Ln(7)

		for i, response := range complaint.Responses {
			pdf.SetFont("Arial", "B", 9)
			adminName := "Admin"
			if response.Admin.ID != 0 {
				adminName = response.Admin.Name
			}
			pdf.Cell(0, 6, fmt.Sprintf("%d. %s - %s", i+1, adminName, response.CreatedAt.Format("02/01/2006 15:04")))
			pdf.Ln(6)
			pdf.SetFont("Arial", "", 9)
			pdf.MultiCell(0, 5, response.ResponseText, "", "L", false)
			pdf.Ln(3)
		}
	}

	return pdf.OutputFileAndClose(filename)
}
