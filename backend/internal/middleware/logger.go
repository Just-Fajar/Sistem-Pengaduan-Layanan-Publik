package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

var defaultLogger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
	Level: slog.LevelInfo,
}))

// SetLogger allows overriding the global slog logger (useful for tests)
func SetLogger(l *slog.Logger) {
	defaultLogger = l
}

// generateRequestID generates a 16-byte random hex string
func generateRequestID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return hex.EncodeToString([]byte(time.Now().String()))[:32]
	}
	return hex.EncodeToString(b)
}

// StructuredLogger returns a gin.HandlerFunc that logs requests with structured key-value attributes via log/slog
func StructuredLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}

		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)

		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		errorMessage := c.Errors.ByType(gin.ErrorTypePrivate).String()

		var userID any
		if uid, exists := c.Get("user_id"); exists {
			userID = uid
		}

		if raw != "" {
			path = path + "?" + raw
		}

		attrs := []slog.Attr{
			slog.String("request_id", requestID),
			slog.Int("status", statusCode),
			slog.String("method", method),
			slog.String("path", path),
			slog.String("ip", clientIP),
			slog.Duration("latency", latency),
			slog.String("user_agent", c.Request.UserAgent()),
		}

		if userID != nil {
			attrs = append(attrs, slog.Any("user_id", userID))
		}

		if errorMessage != "" {
			attrs = append(attrs, slog.String("error", errorMessage))
		}

		// Choose appropriate log level based on HTTP status code
		switch {
		case statusCode >= 500:
			defaultLogger.LogAttrs(c.Request.Context(), slog.LevelError, "HTTP Server Error", attrs...)
		case statusCode >= 400:
			defaultLogger.LogAttrs(c.Request.Context(), slog.LevelWarn, "HTTP Client Error", attrs...)
		default:
			defaultLogger.LogAttrs(c.Request.Context(), slog.LevelInfo, "HTTP Request", attrs...)
		}
	}
}
