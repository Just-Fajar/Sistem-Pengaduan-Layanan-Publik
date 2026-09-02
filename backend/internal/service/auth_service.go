package service

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"
)

type AuthService interface {
	Register(req *models.UserRegisterRequest) (*models.UserResponse, string, error)
	Login(req *models.UserLoginRequest) (*models.UserResponse, string, error)
	GetProfile(userID uint) (*models.UserResponse, error)
	ForgotPassword(email string) (string, error)
	ResetPassword(token string, newPassword string) error
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

func (s *authService) ForgotPassword(email string) (string, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", errors.New("Akun dengan email tersebut tidak ditemukan")
	}

	// Generate secure 32-byte hex token
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	resetToken := hex.EncodeToString(bytes)
	expiresAt := time.Now().Add(1 * time.Hour)

	user.ResetPasswordToken = &resetToken
	user.ResetPasswordExpiresAt = &expiresAt

	if err := s.userRepo.Update(user); err != nil {
		return "", err
	}

	return resetToken, nil
}

func (s *authService) ResetPassword(token string, newPassword string) error {
	user, err := s.userRepo.FindByResetToken(token)
	if err != nil {
		return errors.New("Token reset password tidak valid atau sudah digunakan")
	}

	if user.ResetPasswordExpiresAt == nil || time.Now().After(*user.ResetPasswordExpiresAt) {
		return errors.New("Token reset password sudah kadaluarsa")
	}

	if err := user.HashPassword(newPassword); err != nil {
		return err
	}

	// Clear reset token after successful reset
	user.ResetPasswordToken = nil
	user.ResetPasswordExpiresAt = nil

	return s.userRepo.Update(user)
}
