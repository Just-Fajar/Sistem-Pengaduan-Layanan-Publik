package handlers

import (
	"backend/internal/models"
	"backend/internal/service"
	"backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register handles user registration
// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.UserRegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	user, token, err := h.authService.Register(&req)
	if err != nil {
		if err.Error() == "Email already registered" {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to register user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
		"user":  user,
		"token": token,
	})
}

// Login handles user login
// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.UserLoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	user, token, err := h.authService.Login(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"user":  user,
		"token": token,
	})
}

// GetProfile gets current user profile
// GET /api/auth/me
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user context", nil)
		return
	}

	user, err := h.authService.GetProfile(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile retrieved successfully", user)
}

// ForgotPassword handles sending reset password token
// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	token, err := h.authService.ForgotPassword(req.Email)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	// In local/development, we provide the reset token in the response payload for easy testing
	utils.SuccessResponse(c, http.StatusOK, "Tautan reset password berhasil dibuat", gin.H{
		"message": "Silakan gunakan tautan atau token ini untuk mereset kata sandi",
		"token":   token,
	})
}

// ResetPassword handles resetting password with token
// POST /api/v1/auth/reset-password
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req models.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	if err := h.authService.ResetPassword(req.Token, req.NewPassword); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Kata sandi berhasil diperbarui. Silakan login kembali.", nil)
}
