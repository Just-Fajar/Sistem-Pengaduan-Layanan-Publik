package service

import (
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
)

type ProfileService interface {
	UpdateProfile(userID uint, req *models.UpdateProfileRequest) (*models.UserResponse, error)
	ChangePassword(userID uint, req *models.ChangePasswordRequest) error
}

type profileService struct {
	userRepo repository.UserRepository
}

func NewProfileService(userRepo repository.UserRepository) ProfileService {
	return &profileService{userRepo: userRepo}
}

func (s *profileService) UpdateProfile(userID uint, req *models.UpdateProfileRequest) (*models.UserResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("User not found")
	}

	user.Name = req.Name
	user.Phone = req.Phone

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	res := user.ToUserResponse()
	return &res, nil
}

func (s *profileService) ChangePassword(userID uint, req *models.ChangePasswordRequest) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return errors.New("User not found")
	}

	if err := user.CheckPassword(req.OldPassword); err != nil {
		return errors.New("Old password is incorrect")
	}

	if err := user.HashPassword(req.NewPassword); err != nil {
		return err
	}

	return s.userRepo.Update(user)
}
