package middleware_test

import (
	"backend/internal/middleware"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenerateRandomString_LengthAndUniqueness(t *testing.T) {
	lengths := []int{8, 10, 16, 32}

	for _, length := range lengths {
		str := middleware.GenerateRandomString(length)
		assert.Equal(t, length, len(str), "Generated string must have the requested length")
	}

	// White-Box: Verify uniqueness across 100 consecutive calls (no collisions)
	generated := make(map[string]bool)
	for i := 0; i < 100; i++ {
		s := middleware.GenerateRandomString(12)
		assert.False(t, generated[s], "Generated random string should not collide in consecutive runs")
		generated[s] = true
	}
}
