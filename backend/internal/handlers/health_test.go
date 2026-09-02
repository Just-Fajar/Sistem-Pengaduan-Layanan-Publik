package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/handlers"
	"backend/internal/testutil"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestHealthHandler_LivenessAndReadiness(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := testutil.SetupTestDB(t)

	healthHandler := handlers.NewHealthHandler(db)

	r := gin.New()
	r.GET("/health", healthHandler.Liveness)
	r.GET("/ready", healthHandler.Readiness)

	// 1. Test Liveness
	reqLive, _ := http.NewRequest(http.MethodGet, "/health", nil)
	wLive := httptest.NewRecorder()
	r.ServeHTTP(wLive, reqLive)

	assert.Equal(t, http.StatusOK, wLive.Code)
	var resLive utils.Response
	err := json.Unmarshal(wLive.Body.Bytes(), &resLive)
	assert.NoError(t, err)
	assert.True(t, resLive.Success)

	// 2. Test Readiness with Active DB
	reqReady, _ := http.NewRequest(http.MethodGet, "/ready", nil)
	wReady := httptest.NewRecorder()
	r.ServeHTTP(wReady, reqReady)

	assert.Equal(t, http.StatusOK, wReady.Code)
	var resReady utils.Response
	err = json.Unmarshal(wReady.Body.Bytes(), &resReady)
	assert.NoError(t, err)
	assert.True(t, resReady.Success)

	// 3. Test Readiness with nil DB
	nilHandler := handlers.NewHealthHandler(nil)
	rNil := gin.New()
	rNil.GET("/ready", nilHandler.Readiness)

	wNil := httptest.NewRecorder()
	rNil.ServeHTTP(wNil, reqReady)
	assert.Equal(t, http.StatusServiceUnavailable, wNil.Code)
}
