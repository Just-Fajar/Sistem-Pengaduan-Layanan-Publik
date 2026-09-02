package models_test

import (
	"backend/internal/models"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestComplaint_ToComplaintResponse(t *testing.T) {
	now := time.Now()
	user := models.User{
		ID:        1,
		Name:      "Budi",
		Email:     "budi@example.com",
		Role:      "user",
		CreatedAt: now,
	}

	category := models.Category{
		ID:          2,
		Name:        "Infrastruktur",
		Description: "Fasilitas umum",
	}

	response := models.Response{
		ID:           10,
		ComplaintID:  100,
		AdminID:      5,
		ResponseText: "Sedang ditindaklanjuti",
		CreatedAt:    now,
		Admin: models.User{
			ID:    5,
			Name:  "Admin Petugas",
			Email: "petugas@example.com",
			Role:  "admin",
		},
	}

	complaint := models.Complaint{
		ID:          100,
		UserID:      1,
		CategoryID:  2,
		Title:       "Jalan Berlubang di RT 03",
		Description: "Tolong segera diperbaiki karena membahayakan pengendara",
		PhotoURL:    "/uploads/photo.jpg",
		Status:      models.StatusProcessing,
		CreatedAt:   now,
		UpdatedAt:   now,
		User:        user,
		Category:    category,
		Responses:   []models.Response{response},
	}

	// White-Box: Verify complete conversion with relations
	res := complaint.ToComplaintResponse()

	assert.Equal(t, uint(100), res.ID)
	assert.Equal(t, uint(1), res.UserID)
	assert.Equal(t, uint(2), res.CategoryID)
	assert.Equal(t, "Jalan Berlubang di RT 03", res.Title)
	assert.Equal(t, models.StatusProcessing, res.Status)
	assert.NotNil(t, res.User)
	assert.Equal(t, "Budi", res.User.Name)
	assert.NotNil(t, res.Category)
	assert.Equal(t, "Infrastruktur", res.Category.Name)
	assert.Len(t, res.Responses, 1)
	assert.Equal(t, "Sedang ditindaklanjuti", res.Responses[0].ResponseText)
	assert.NotNil(t, res.Responses[0].Admin)
	assert.Equal(t, "Admin Petugas", res.Responses[0].Admin.Name)

	// White-Box: Verify conversion without relations (zero values)
	emptyComplaint := models.Complaint{
		ID:          101,
		UserID:      2,
		CategoryID:  3,
		Title:       "Sampah Menumpuk",
		Description: "Sampah belum diangkut 3 hari",
		Status:      models.StatusPending,
	}

	emptyRes := emptyComplaint.ToComplaintResponse()
	assert.Equal(t, uint(101), emptyRes.ID)
	assert.Nil(t, emptyRes.User)
	assert.Nil(t, emptyRes.Category)
	assert.Empty(t, emptyRes.Responses)
}
