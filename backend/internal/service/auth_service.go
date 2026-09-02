package service

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"errors"
)

type AuthService interface {
	Register(req *models.UserRegisterRequest) (*models.UserResponse, string, error)
	Login(req *models.UserLoginRequest) (*models.UserResponse, string, error)
	GetProfile(userID uint) (*models.UserResponse, error)
}

type authService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authService{userRepo: userRepo}
}

func (s *authService) Register(req *models.UserRegisterRequest) (*models.UserResponse, string, error) {
	// Check if email already exists
	if _, err := s.userRepo.FindByEmail(req.Email); err == nil {
		return nil, "", errors.New("Email already registered")
	}

	user := models.User{
		Name:  req.Name,
		Email: req.Email,
		Phone: req.Phone,
		Role:  "user",
	}

	if err := user.HashPassword(req.Password); err != nil {
		return nil, "", err
	}

	if err := s.userRepo.Create(&user); err != nil {
		return nil, "", err
	}

	token, err := utils.GenerateToken(&user)
	if err != nil {
		return nil, "", err
	}

	res := user.ToUserResponse()
	return &res, token, nil
}

func (s *authService) Login(req *models.UserLoginRequest) (*models.UserResponse, string, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, "", errors.New("Invalid email or password")
	}

	if err := user.CheckPassword(req.Password); err != nil {
		return nil, "", errors.New("Invalid email or password")
	}

	token, err := utils.GenerateToken(user)
	if err != nil {
		return nil, "", err
	}

	res := user.ToUserResponse()
	return &res, token, nil
}

func (s *authService) GetProfile(userID uint) (*models.UserResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("User not found")
	}
	res := user.ToUserResponse()
	return &res, nil
}
