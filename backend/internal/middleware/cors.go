package middleware

import (
	"backend/internal/config"
	"backend/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles CORS with restricted origin
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		allowedOrigin := "http://localhost:3000"
		if config.AppConfig != nil && config.AppConfig.Server.AllowedOrigin != "" {
			allowedOrigin = config.AppConfig.Server.AllowedOrigin
		}

		origin := c.Request.Header.Get("Origin")

		if allowedOrigin == "*" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		} else {
			allowedList := strings.Split(allowedOrigin, ",")
			matched := false
			for _, o := range allowedList {
				trimmed := strings.TrimSpace(o)
				if origin == trimmed {
					c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
					matched = true
					break
				}
			}
			if !matched && len(allowedList) > 0 {
				c.Writer.Header().Set("Access-Control-Allow-Origin", strings.TrimSpace(allowedList[0]))
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// ErrorHandler handles panics and errors
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				utils.ErrorResponse(c, http.StatusInternalServerError, "Internal server error", err)
			}
		}()
		c.Next()
	}
}
