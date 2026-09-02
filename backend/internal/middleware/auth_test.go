package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	user := &models.User{
		ID:    1,
		Email: "user@example.com",
		Role:  "user",
	}
	validToken, err := utils.GenerateToken(user)
	assert.NoError(t, err)

	r := gin.New()
	r.Use(middleware.AuthMiddleware())
	r.GET("/protected", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		email, _ := c.Get("email")
		role, _ := c.Get("role")
		c.JSON(http.StatusOK, gin.H{
			"user_id": userID,
			"email":   email,
			"role":    role,
		})
	})

	// White-Box: Missing Authorization Header -> 401
	reqMissing, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	wMissing := httptest.NewRecorder()
	r.ServeHTTP(wMissing, reqMissing)
	assert.Equal(t, http.StatusUnauthorized, wMissing.Code)

	// White-Box: Malformed Header (Not Bearer) -> 401
	reqMalformed, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	reqMalformed.Header.Set("Authorization", "Basic 12345")
	wMalformed := httptest.NewRecorder()
	r.ServeHTTP(wMalformed, reqMalformed)
	assert.Equal(t, http.StatusUnauthorized, wMalformed.Code)

	// White-Box: Invalid Token -> 401
	reqInvalid, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	reqInvalid.Header.Set("Authorization", "Bearer invalid-jwt-token-xyz")
	wInvalid := httptest.NewRecorder()
	r.ServeHTTP(wInvalid, reqInvalid)
	assert.Equal(t, http.StatusUnauthorized, wInvalid.Code)

	// White-Box: Valid Token -> 200
	reqValid, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	reqValid.Header.Set("Authorization", "Bearer "+validToken)
	wValid := httptest.NewRecorder()
	r.ServeHTTP(wValid, reqValid)
	assert.Equal(t, http.StatusOK, wValid.Code)
}

func TestAdminMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	admin := &models.User{ID: 2, Email: "admin@example.com", Role: "admin"}
	adminToken, err := utils.GenerateToken(admin)
	assert.NoError(t, err)

	regularUser := &models.User{ID: 3, Email: "user@example.com", Role: "user"}
	userToken, err := utils.GenerateToken(regularUser)
	assert.NoError(t, err)

	r := gin.New()
	r.Use(middleware.AuthMiddleware())
	r.Use(middleware.AdminMiddleware())
	r.GET("/admin-only", func(c *gin.Context) {
		c.String(http.StatusOK, "admin granted")
	})

	// White-Box: Regular user trying to access admin endpoint -> 403 Forbidden
	reqUser, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	reqUser.Header.Set("Authorization", "Bearer "+userToken)
	wUser := httptest.NewRecorder()
	r.ServeHTTP(wUser, reqUser)
	assert.Equal(t, http.StatusForbidden, wUser.Code)

	// White-Box: Admin user accessing admin endpoint -> 200 OK
	reqAdmin, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	reqAdmin.Header.Set("Authorization", "Bearer "+adminToken)
	wAdmin := httptest.NewRecorder()
	r.ServeHTTP(wAdmin, reqAdmin)
	assert.Equal(t, http.StatusOK, wAdmin.Code)
}
