package utils_test

import (
	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/utils"
	"testing"

	"github.com/stretchr/testify/assert"
)

func init() {
	config.AppConfig = &config.Config{
		JWT: config.JWTConfig{
			Secret:      "test-secret-key-123456",
			ExpireHours: 24,
		},
	}
}

func TestJWT_GenerateAndValidateToken(t *testing.T) {
	user := &models.User{
		ID:    10,
		Email: "testuser@example.com",
		Role:  "user",
	}

	// White-Box: Test Token Generation
	token, err := utils.GenerateToken(user)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// White-Box: Test Valid Token Validation
	claims, err := utils.ValidateToken(token)
	assert.NoError(t, err)
	assert.NotNil(t, claims)
	assert.Equal(t, uint(10), claims.UserID)
	assert.Equal(t, "testuser@example.com", claims.Email)
	assert.Equal(t, "user", claims.Role)

	// White-Box: Test Invalid/Tampered Token Validation
	invalidClaims, err := utils.ValidateToken("invalid.token.string")
	assert.Error(t, err)
	assert.Nil(t, invalidClaims)
}
