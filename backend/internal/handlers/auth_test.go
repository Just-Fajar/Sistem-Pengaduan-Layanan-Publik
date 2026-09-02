package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/handlers"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/internal/testutil"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAuthHandler_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authService)

	r := gin.New()
	r.POST("/api/auth/register", authHandler.Register)

	// White-Box / Black-Box: Successful Registration
	reqBody := models.UserRegisterRequest{
		Name:     "Budi Santoso",
		Email:    "budi@example.com",
		Password: "password123",
		Phone:    "081234567890",
	}
	bodyBytes, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response utils.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.True(t, response.Success)

	// Duplicate Email Registration
	wDup := httptest.NewRecorder()
	reqDup, _ := http.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(bodyBytes))
	reqDup.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wDup, reqDup)

	assert.Equal(t, http.StatusBadRequest, wDup.Code)
}

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	// Seed user with testutil
	user, _ := testutil.CreateTestUser(t, db, "user")

	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authService)

	r := gin.New()
	r.POST("/api/auth/login", authHandler.Login)

	// Valid Login
	loginReq := models.UserLoginRequest{
		Email:    user.Email,
		Password: "password123",
	}
	bodyBytes, _ := json.Marshal(loginReq)
	req, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Invalid Password
	badReq := models.UserLoginRequest{
		Email:    user.Email,
		Password: "wrongpassword",
	}
	badBytes, _ := json.Marshal(badReq)
	reqBad, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(badBytes))
	reqBad.Header.Set("Content-Type", "application/json")
	wBad := httptest.NewRecorder()
	r.ServeHTTP(wBad, reqBad)

	assert.Equal(t, http.StatusUnauthorized, wBad.Code)
}

func TestAuthHandler_ForgotPasswordAndReset(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	user, _ := testutil.CreateTestUser(t, db, "user")

	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authService)

	r := gin.New()
	r.POST("/api/auth/forgot-password", authHandler.ForgotPassword)
	r.POST("/api/auth/reset-password", authHandler.ResetPassword)

	// 1. Request Forgot Password
	forgotReq := models.ForgotPasswordRequest{Email: user.Email}
	bodyBytes, _ := json.Marshal(forgotReq)
	reqForgot, _ := http.NewRequest(http.MethodPost, "/api/auth/forgot-password", bytes.NewBuffer(bodyBytes))
	reqForgot.Header.Set("Content-Type", "application/json")
	wForgot := httptest.NewRecorder()
	r.ServeHTTP(wForgot, reqForgot)

	assert.Equal(t, http.StatusOK, wForgot.Code)
	var resForgot utils.Response
	err := json.Unmarshal(wForgot.Body.Bytes(), &resForgot)
	assert.NoError(t, err)

	dataMap, ok := resForgot.Data.(map[string]interface{})
	assert.True(t, ok)
	token, ok := dataMap["token"].(string)
	assert.True(t, ok)
	assert.NotEmpty(t, token)

	// 2. Reset Password with token
	resetReq := models.ResetPasswordRequest{
		Token:       token,
		NewPassword: "newpassword123",
	}
	resetBytes, _ := json.Marshal(resetReq)
	reqReset, _ := http.NewRequest(http.MethodPost, "/api/auth/reset-password", bytes.NewBuffer(resetBytes))
	reqReset.Header.Set("Content-Type", "application/json")
	wReset := httptest.NewRecorder()
	r.ServeHTTP(wReset, reqReset)

	assert.Equal(t, http.StatusOK, wReset.Code)
}
