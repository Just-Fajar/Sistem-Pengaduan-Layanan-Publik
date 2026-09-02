package middleware

import (
	"backend/internal/utils"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// IPRateLimiter manages IP-based token bucket limiters
type IPRateLimiter struct {
	mu      sync.Mutex
	clients map[string]*client
	rate    rate.Limit
	burst   int
}

// NewIPRateLimiter creates a new IPRateLimiter with custom rate and burst
func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	limiter := &IPRateLimiter{
		clients: make(map[string]*client),
		rate:    r,
		burst:   b,
	}

	// Periodic cleanup of stale clients (older than 3 minutes)
	go limiter.cleanupStaleClients()

	return limiter
}

func (i *IPRateLimiter) getLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	c, exists := i.clients[ip]
	if !exists {
		limiter := rate.NewLimiter(i.rate, i.burst)
		i.clients[ip] = &client{limiter: limiter, lastSeen: time.Now()}
		return limiter
	}

	c.lastSeen = time.Now()
	return c.limiter
}

func (i *IPRateLimiter) cleanupStaleClients() {
	ticker := time.NewTicker(time.Minute)
	for range ticker.C {
		i.mu.Lock()
		for ip, c := range i.clients {
			if time.Since(c.lastSeen) > 3*time.Minute {
				delete(i.clients, ip)
			}
		}
		i.mu.Unlock()
	}
}

// Middleware returns a Gin middleware for rate limiting
func (i *IPRateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := i.getLimiter(ip)

		if !limiter.Allow() {
			utils.ErrorResponse(c, http.StatusTooManyRequests, "Terlalu banyak permintaan. Silakan coba beberapa saat lagi.", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

// GlobalRateLimiter allows up to 100 requests per minute with burst of 100
func GlobalRateLimiter() gin.HandlerFunc {
	limiter := NewIPRateLimiter(rate.Every(time.Minute/100), 100)
	return limiter.Middleware()
}

// AuthRateLimiter allows up to 5 requests per minute with burst of 5 (for sensitive auth routes)
func AuthRateLimiter() gin.HandlerFunc {
	limiter := NewIPRateLimiter(rate.Every(time.Minute/5), 5)
	return limiter.Middleware()
}
