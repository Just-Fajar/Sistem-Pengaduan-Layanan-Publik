package middleware_test

import (
	"backend/internal/config"
	"backend/internal/middleware"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCORSMiddleware_AllowedOrigin(t *testing.T) {
	gin.SetMode(gin.TestMode)

	config.AppConfig = &config.Config{
		Server: config.ServerConfig{
			AllowedOrigin: "http://localhost:3000",
		},
	}

	r := gin.New()
	r.Use(middleware.CORSMiddleware())
	r.GET("/test", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	// White-Box / Black-Box: Allowed Origin Request
	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "http://localhost:3000", w.Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "true", w.Header().Get("Access-Control-Allow-Credentials"))
}

func TestCORSMiddleware_OptionsPreflight(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.Use(middleware.CORSMiddleware())
	r.OPTIONS("/test", func(c *gin.Context) {})

	req, _ := http.NewRequest(http.MethodOptions, "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
}

func TestSecurityHeadersMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.Use(middleware.SecurityHeadersMiddleware())
	r.GET("/test-sec", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	req, _ := http.NewRequest(http.MethodGet, "/test-sec", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "nosniff", w.Header().Get("X-Content-Type-Options"))
	assert.Equal(t, "DENY", w.Header().Get("X-Frame-Options"))
	assert.Equal(t, "1; mode=block", w.Header().Get("X-XSS-Protection"))
	assert.Equal(t, "strict-origin-when-cross-origin", w.Header().Get("Referrer-Policy"))
}
