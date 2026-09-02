package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/internal/testutil"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestProfileHandler_UpdateAndChangePassword(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	_, userToken := testutil.CreateTestUser(t, db, "user")

	userRepo := repository.NewUserRepository(db)
	profileService := service.NewProfileService(userRepo)
	profileHandler := handlers.NewProfileHandler(profileService)

	r := gin.New()
	r.Use(middleware.AuthMiddleware())
	r.PUT("/api/profile", profileHandler.UpdateProfile)
	r.PUT("/api/profile/password", profileHandler.ChangePassword)

	// 1. Update Profile
	updateReq := models.UpdateProfileRequest{
		Name:  "Budi Santoso Baru",
		Phone: "089876543210",
	}
	bodyBytes, _ := json.Marshal(updateReq)
	reqUpdate, _ := http.NewRequest(http.MethodPut, "/api/profile", bytes.NewBuffer(bodyBytes))
	reqUpdate.Header.Set("Authorization", "Bearer "+userToken)
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	r.ServeHTTP(wUpdate, reqUpdate)

	assert.Equal(t, http.StatusOK, wUpdate.Code)

	// 2. Change Password - Incorrect Old Password
	badPassReq := models.ChangePasswordRequest{
		OldPassword: "wrongpassword",
		NewPassword: "newpassword123",
	}
	badPassBytes, _ := json.Marshal(badPassReq)
	reqBadPass, _ := http.NewRequest(http.MethodPut, "/api/profile/password", bytes.NewBuffer(badPassBytes))
	reqBadPass.Header.Set("Authorization", "Bearer "+userToken)
	reqBadPass.Header.Set("Content-Type", "application/json")
	wBadPass := httptest.NewRecorder()
	r.ServeHTTP(wBadPass, reqBadPass)

	assert.Equal(t, http.StatusBadRequest, wBadPass.Code)

	// 3. Change Password - Correct
	passReq := models.ChangePasswordRequest{
		OldPassword: "password123",
		NewPassword: "newpassword123",
	}
	passBytes, _ := json.Marshal(passReq)
	reqPass, _ := http.NewRequest(http.MethodPut, "/api/profile/password", bytes.NewBuffer(passBytes))
	reqPass.Header.Set("Authorization", "Bearer "+userToken)
	reqPass.Header.Set("Content-Type", "application/json")
	wPass := httptest.NewRecorder()
	r.ServeHTTP(wPass, reqPass)

	assert.Equal(t, http.StatusOK, wPass.Code)
}
