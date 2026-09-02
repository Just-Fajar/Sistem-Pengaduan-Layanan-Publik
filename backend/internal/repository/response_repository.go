package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type ResponseRepository interface {
	Create(response *models.Response) error
	FindByComplaintID(complaintID uint) ([]models.Response, error)
}

type responseRepository struct {
	db *gorm.DB
}

func NewResponseRepository(db *gorm.DB) ResponseRepository {
	return &responseRepository{db: db}
}

func (r *responseRepository) Create(response *models.Response) error {
	return r.db.Create(response).Error
}

func (r *responseRepository) FindByComplaintID(complaintID uint) ([]models.Response, error) {
	var responses []models.Response
	err := r.db.Preload("Admin").
		Where("complaint_id = ?", complaintID).
		Order("created_at ASC").
		Find(&responses).Error
	return responses, err
}
