package config_test

import (
	"backend/internal/config"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadConfig_JWTSecretValidation(t *testing.T) {
	// White-Box: Test Production with Default JWT Secret must fail
	os.Setenv("ENV", "production")
	os.Setenv("JWT_SECRET", "default-secret-key")
	defer os.Unsetenv("ENV")
	defer os.Unsetenv("JWT_SECRET")

	cfg, err := config.LoadConfig()
	assert.Error(t, err)
	assert.Nil(t, cfg)
	assert.Contains(t, err.Error(), "JWT_SECRET must be explicitly configured")

	// White-Box: Test Production with Secure Custom Key must succeed
	os.Setenv("JWT_SECRET", "super-secure-production-jwt-key-999")
	cfg, err = config.LoadConfig()
	assert.NoError(t, err)
	assert.NotNil(t, cfg)
	assert.Equal(t, "super-secure-production-jwt-key-999", cfg.JWT.Secret)
}
