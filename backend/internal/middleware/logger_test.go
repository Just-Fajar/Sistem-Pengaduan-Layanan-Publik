package middleware_test

import (
	"bytes"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestStructuredLogger(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var logBuf bytes.Buffer
	testLogger := slog.New(slog.NewJSONHandler(&logBuf, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))
	middleware.SetLogger(testLogger)

	r := gin.New()
	r.Use(middleware.StructuredLogger())

	r.GET("/test-ok", func(c *gin.Context) {
		c.Set("user_id", uint(42))
		c.String(http.StatusOK, "ok")
	})

	r.GET("/test-client-err", func(c *gin.Context) {
		c.String(http.StatusBadRequest, "bad request")
	})

	r.GET("/test-server-err", func(c *gin.Context) {
		_ = c.Error(errors.New("db connection failure"))
		c.String(http.StatusInternalServerError, "server error")
	})

	// 1. Test 200 OK request & request_id auto-generation
	req1, _ := http.NewRequest(http.MethodGet, "/test-ok?filter=active", nil)
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)

	assert.Equal(t, http.StatusOK, w1.Code)
	assert.NotEmpty(t, w1.Header().Get("X-Request-ID"))
	assert.Contains(t, logBuf.String(), "HTTP Request")
	assert.Contains(t, logBuf.String(), "/test-ok?filter=active")

	// 2. Test Custom X-Request-ID propagation
	logBuf.Reset()
	req2, _ := http.NewRequest(http.MethodGet, "/test-client-err", nil)
	req2.Header.Set("X-Request-ID", "custom-req-id-12345")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusBadRequest, w2.Code)
	assert.Equal(t, "custom-req-id-12345", w2.Header().Get("X-Request-ID"))
	assert.Contains(t, logBuf.String(), "HTTP Client Error")
	assert.Contains(t, logBuf.String(), "custom-req-id-12345")

	// 3. Test 500 Error logging
	logBuf.Reset()
	req3, _ := http.NewRequest(http.MethodGet, "/test-server-err", nil)
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)

	assert.Equal(t, http.StatusInternalServerError, w3.Code)
	assert.Contains(t, logBuf.String(), "HTTP Server Error")
	assert.Contains(t, logBuf.String(), "db connection failure")
}
