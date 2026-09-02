package repository

import (
	"backend/internal/models"
	"backend/internal/utils"

	"gorm.io/gorm"
)

type ComplaintFilter struct {
	Status     string
	CategoryID string
	Search     string
	DateFrom   string
	DateTo     string
}

type ComplaintRepository interface {
	Create(complaint *models.Complaint) error
	FindByID(id uint) (*models.Complaint, error)
	FindByIDAndUserID(id uint, userID uint) (*models.Complaint, error)
	FindByUserID(userID uint, status string, params utils.PaginationParams) ([]models.Complaint, int64, error)
	FindAll(filters ComplaintFilter, params utils.PaginationParams) ([]models.Complaint, int64, error)
	FindAllWithoutPagination(filters ComplaintFilter) ([]models.Complaint, error)
	Update(complaint *models.Complaint) error
	UpdateStatus(id uint, status models.ComplaintStatus) error
	CountTotal() (int64, error)
	CountByStatus(status models.ComplaintStatus) (int64, error)
	GetCategoryStats() ([]models.CategoryStat, error)
}

type complaintRepository struct {
	db *gorm.DB
}

func NewComplaintRepository(db *gorm.DB) ComplaintRepository {
	return &complaintRepository{db: db}
}

func (r *complaintRepository) Create(complaint *models.Complaint) error {
	return r.db.Create(complaint).Error
}

func (r *complaintRepository) FindByID(id uint) (*models.Complaint, error) {
	var complaint models.Complaint
	err := r.db.Preload("User").
		Preload("Category").
		Preload("Responses.Admin").
		First(&complaint, id).Error
	if err != nil {
		return nil, err
	}
	return &complaint, nil
}

func (r *complaintRepository) FindByIDAndUserID(id uint, userID uint) (*models.Complaint, error) {
	var complaint models.Complaint
	err := r.db.Preload("User").
		Preload("Category").
		Preload("Responses.Admin").
		Where("id = ? AND user_id = ?", id, userID).
		First(&complaint).Error
	if err != nil {
		return nil, err
	}
	return &complaint, nil
}

func (r *complaintRepository) FindByUserID(userID uint, status string, params utils.PaginationParams) ([]models.Complaint, int64, error) {
	var complaints []models.Complaint
	var totalRows int64

	query := r.db.Model(&models.Complaint{}).
		Where("user_id = ?", userID).
		Preload("Category").
		Preload("Responses")

	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&totalRows).Error; err != nil {
		return nil, 0, err
	}

	err := query.Scopes(utils.Paginate(params)).Order("created_at DESC").Find(&complaints).Error
	return complaints, totalRows, err
}

func (r *complaintRepository) buildFilterQuery(filters ComplaintFilter) *gorm.DB {
	query := r.db.Model(&models.Complaint{}).
		Preload("User").
		Preload("Category").
		Preload("Responses.Admin")

	if filters.Status != "" && filters.Status != "all" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.CategoryID != "" {
		query = query.Where("category_id = ?", filters.CategoryID)
	}
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where("title LIKE ? OR description LIKE ?", searchPattern, searchPattern)
	}
	if filters.DateFrom != "" {
		query = query.Where("created_at >= ?", filters.DateFrom+" 00:00:00")
	}
	if filters.DateTo != "" {
		query = query.Where("created_at <= ?", filters.DateTo+" 23:59:59")
	}

	return query
}

func (r *complaintRepository) FindAll(filters ComplaintFilter, params utils.PaginationParams) ([]models.Complaint, int64, error) {
	var complaints []models.Complaint
	var totalRows int64

	query := r.buildFilterQuery(filters)

	if err := query.Count(&totalRows).Error; err != nil {
		return nil, 0, err
	}

	err := query.Scopes(utils.Paginate(params)).Order("created_at DESC").Find(&complaints).Error
	return complaints, totalRows, err
}

func (r *complaintRepository) FindAllWithoutPagination(filters ComplaintFilter) ([]models.Complaint, error) {
	var complaints []models.Complaint
	query := r.buildFilterQuery(filters)
	err := query.Order("created_at DESC").Find(&complaints).Error
	return complaints, err
}

func (r *complaintRepository) Update(complaint *models.Complaint) error {
	return r.db.Save(complaint).Error
}

func (r *complaintRepository) UpdateStatus(id uint, status models.ComplaintStatus) error {
	return r.db.Model(&models.Complaint{}).Where("id = ?", id).Update("status", status).Error
}

func (r *complaintRepository) CountTotal() (int64, error) {
	var count int64
	err := r.db.Model(&models.Complaint{}).Count(&count).Error
	return count, err
}

func (r *complaintRepository) CountByStatus(status models.ComplaintStatus) (int64, error) {
	var count int64
	err := r.db.Model(&models.Complaint{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

func (r *complaintRepository) GetCategoryStats() ([]models.CategoryStat, error) {
	categoryStats := make([]models.CategoryStat, 0)
	err := r.db.Table("complaints").
		Select("categories.name as category_name, count(complaints.id) as total").
		Joins("JOIN categories ON categories.id = complaints.category_id").
		Where("complaints.deleted_at IS NULL AND categories.deleted_at IS NULL").
		Group("categories.id, categories.name").
		Scan(&categoryStats).Error
	return categoryStats, err
}
