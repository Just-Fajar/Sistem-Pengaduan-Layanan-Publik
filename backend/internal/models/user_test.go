package models_test

import (
	"backend/internal/models"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUser_HashAndCheckPassword(t *testing.T) {
	user := &models.User{}
	rawPassword := "SecurePassword123!"

	// White-Box: Test hashing password
	err := user.HashPassword(rawPassword)
	assert.NoError(t, err)
	assert.NotEmpty(t, user.Password)
	assert.NotEqual(t, rawPassword, user.Password)

	// White-Box: Test valid password check
	err = user.CheckPassword(rawPassword)
	assert.NoError(t, err)

	// White-Box: Test invalid password check
	err = user.CheckPassword("WrongPassword123")
	assert.Error(t, err)
}

func TestUser_ToUserResponse(t *testing.T) {
	now := time.Now()
	user := &models.User{
		ID:        1,
		Name:      "Budi Santoso",
		Email:     "budi@example.com",
		Password:  "$2a$10$hashedpasswordhere",
		Phone:     "081234567890",
		Role:      "user",
		CreatedAt: now,
	}

	response := user.ToUserResponse()

	assert.Equal(t, uint(1), response.ID)
	assert.Equal(t, "Budi Santoso", response.Name)
	assert.Equal(t, "budi@example.com", response.Email)
	assert.Equal(t, "081234567890", response.Phone)
	assert.Equal(t, "user", response.Role)
	assert.Equal(t, now, response.CreatedAt)
}

func TestUser_IsAdmin(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{name: "Admin role", role: "admin", expected: true},
		{name: "User role", role: "user", expected: false},
		{name: "Empty role", role: "", expected: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &models.User{Role: tt.role}
			assert.Equal(t, tt.expected, user.IsAdmin())
		})
	}
}
