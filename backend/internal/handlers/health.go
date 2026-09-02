package handlers

import (
	"context"
	"net/http"
	"time"

	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HealthHandler struct {
	db *gorm.DB
}

func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// Liveness probe (GET /health) returns 200 OK as long as the HTTP process is alive
func (h *HealthHandler) Liveness(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Service is alive", gin.H{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

// Readiness probe (GET /ready) checks underlying dependencies like SQL database connectivity
func (h *HealthHandler) Readiness(c *gin.Context) {
	if h.db == nil {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Database instance not initialized", nil)
		return
	}

	sqlDB, err := h.db.DB()
	if err != nil {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Failed to get database instance", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	if err := sqlDB.PingContext(ctx); err != nil {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Database unreachable", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Service is ready to accept traffic", gin.H{
		"status":    "ready",
		"database":  "connected",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
