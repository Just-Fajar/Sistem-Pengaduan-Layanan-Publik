package service

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"errors"
)

type AdminService interface {
	GetDashboardStats() (map[string]interface{}, error)
	GetAllComplaints(filters repository.ComplaintFilter, params utils.PaginationParams) (*utils.PaginationResult, error)
	GetComplaintDetail(id uint) (*models.ComplaintResponse, error)
	UpdateComplaintStatus(id uint, status models.ComplaintStatus) (*models.ComplaintResponse, error)
	AddResponse(complaintID uint, adminID uint, responseText string) (*models.ResponseItem, error)
}

type adminService struct {
	complaintRepo repository.ComplaintRepository
	userRepo      repository.UserRepository
	responseRepo  repository.ResponseRepository
}

func NewAdminService(
	complaintRepo repository.ComplaintRepository,
	userRepo repository.UserRepository,
	responseRepo repository.ResponseRepository,
) AdminService {
	return &adminService{
		complaintRepo: complaintRepo,
		userRepo:      userRepo,
		responseRepo:  responseRepo,
	}
}

func (s *adminService) GetDashboardStats() (map[string]interface{}, error) {
	totalComplaints, err := s.complaintRepo.CountTotal()
	if err != nil {
		return nil, err
	}

	pendingComplaints, err := s.complaintRepo.CountByStatus(models.StatusPending)
	if err != nil {
		return nil, err
	}

	processingComplaints, err := s.complaintRepo.CountByStatus(models.StatusProcessing)
	if err != nil {
		return nil, err
	}

	completedComplaints, err := s.complaintRepo.CountByStatus(models.StatusCompleted)
	if err != nil {
		return nil, err
	}

	totalUsers, err := s.userRepo.CountByRole("user")
	if err != nil {
		return nil, err
	}

	categoryStats, err := s.complaintRepo.GetCategoryStats()
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_complaints":        totalComplaints,
		"pending_complaints":      pendingComplaints,
		"processing_complaints":   processingComplaints,
		"completed_complaints":    completedComplaints,
		"total_users":             totalUsers,
		"complaints_by_category": categoryStats,
	}, nil
}

func (s *adminService) GetAllComplaints(filters repository.ComplaintFilter, params utils.PaginationParams) (*utils.PaginationResult, error) {
	complaints, totalRows, err := s.complaintRepo.FindAll(filters, params)
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

func (s *adminService) GetComplaintDetail(id uint) (*models.ComplaintResponse, error) {
	complaint, err := s.complaintRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("Complaint not found")
	}

	res := complaint.ToComplaintResponse()
	return &res, nil
}

func (s *adminService) UpdateComplaintStatus(id uint, status models.ComplaintStatus) (*models.ComplaintResponse, error) {
	complaint, err := s.complaintRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("Complaint not found")
	}

	oldStatus := string(complaint.Status)
	if err := s.complaintRepo.UpdateStatus(id, status); err != nil {
		return nil, err
	}

	// Reload updated complaint
	updatedComplaint, err := s.complaintRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Send email notification async
	if updatedComplaint.User.Email != "" {
		emailService := utils.NewEmailService()
		go emailService.SendStatusUpdateNotification(
			updatedComplaint.User.Email,
			updatedComplaint.User.Name,
			updatedComplaint.Title,
			oldStatus,
			string(status),
		)
	}

	res := updatedComplaint.ToComplaintResponse()
	return &res, nil
}

func (s *adminService) AddResponse(complaintID uint, adminID uint, responseText string) (*models.ResponseItem, error) {
	complaint, err := s.complaintRepo.FindByID(complaintID)
	if err != nil {
		return nil, errors.New("Complaint not found")
	}

	response := models.Response{
		ComplaintID:  complaint.ID,
		AdminID:      adminID,
		ResponseText: responseText,
	}

	if err := s.responseRepo.Create(&response); err != nil {
		return nil, err
	}

	// Send email notification async
	if complaint.User.Email != "" {
		emailService := utils.NewEmailService()
		go emailService.SendResponseNotification(
			complaint.User.Email,
			complaint.User.Name,
			complaint.Title,
			responseText,
		)
	}

	item := response.ToResponseItem()
	return &item, nil
}
