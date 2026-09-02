package service

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"errors"
	"fmt"
)

type ComplaintService interface {
	CreateComplaint(userID uint, req *models.CreateComplaintRequest, photoFilename string) (*models.ComplaintResponse, error)
	GetMyComplaints(userID uint, status string, params utils.PaginationParams) (*utils.PaginationResult, error)
	GetComplaintDetail(id uint, userID uint) (*models.ComplaintResponse, error)
}

type complaintService struct {
	complaintRepo repository.ComplaintRepository
	categoryRepo  repository.CategoryRepository
}

func NewComplaintService(complaintRepo repository.ComplaintRepository, categoryRepo repository.CategoryRepository) ComplaintService {
	return &complaintService{
		complaintRepo: complaintRepo,
		categoryRepo:  categoryRepo,
	}
}

func (s *complaintService) CreateComplaint(userID uint, req *models.CreateComplaintRequest, photoFilename string) (*models.ComplaintResponse, error) {
	// Verify category exists
	if _, err := s.categoryRepo.FindByID(req.CategoryID); err != nil {
		return nil, errors.New("Category not found")
	}

	complaint := models.Complaint{
		UserID:      userID,
		CategoryID:  req.CategoryID,
		Title:       req.Title,
		Description: req.Description,
		Status:      models.StatusPending,
	}

	if photoFilename != "" {
		complaint.PhotoURL = fmt.Sprintf("/uploads/%s", photoFilename)
	}

	if err := s.complaintRepo.Create(&complaint); err != nil {
		return nil, err
	}

	// Fetch fresh complaint with relations
	savedComplaint, err := s.complaintRepo.FindByID(complaint.ID)
	if err != nil {
		res := complaint.ToComplaintResponse()
		return &res, nil
	}

	res := savedComplaint.ToComplaintResponse()
	return &res, nil
}

func (s *complaintService) GetMyComplaints(userID uint, status string, params utils.PaginationParams) (*utils.PaginationResult, error) {
	complaints, totalRows, err := s.complaintRepo.FindByUserID(userID, status, params)
	if err != nil {
		return nil, err
	}

	responses := make([]models.ComplaintResponse, len(complaints))
	for i, complaint := range complaints {
		responses[i] = complaint.ToComplaintResponse()
	}

	result := utils.BuildPaginationResult(params.Page, params.PageSize, totalRows, responses)
	return &result, nil
}

func (s *complaintService) GetComplaintDetail(id uint, userID uint) (*models.ComplaintResponse, error) {
	complaint, err := s.complaintRepo.FindByIDAndUserID(id, userID)
	if err != nil {
		return nil, errors.New("Complaint not found")
	}

	res := complaint.ToComplaintResponse()
	return &res, nil
}
