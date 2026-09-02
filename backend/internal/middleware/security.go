package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeadersMiddleware sets standard OWASP security headers on all responses
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent MIME type sniffing
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")

		// Prevent clickjacking by denying iframe rendering
		c.Writer.Header().Set("X-Frame-Options", "DENY")

		// Enable XSS filter protection in legacy browsers
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")

		// Control referrer policy
		c.Writer.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		c.Next()
	}
}
