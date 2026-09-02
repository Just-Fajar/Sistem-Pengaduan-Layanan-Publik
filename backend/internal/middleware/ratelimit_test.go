package middleware_test

import (
	"backend/internal/middleware"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/time/rate"
)

func TestIPRateLimiter_AllowAndBlock(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Custom limiter allowing 3 requests with burst of 3
	ipLimiter := middleware.NewIPRateLimiter(rate.Every(time.Minute), 3)

	r := gin.New()
	r.Use(ipLimiter.Middleware())
	r.GET("/limited", func(c *gin.Context) {
		c.String(http.StatusOK, "success")
	})

	// First 3 requests should succeed
	for i := 0; i < 3; i++ {
		req, _ := http.NewRequest(http.MethodGet, "/limited", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code, "Request %d should be allowed", i+1)
	}

	// 4th request must be blocked with 429 Too Many Requests
	req, _ := http.NewRequest(http.MethodGet, "/limited", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusTooManyRequests, w.Code, "4th request should exceed rate limit")
}
