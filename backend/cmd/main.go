package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/routes"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	if err := database.Connect(&cfg.Database); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Set Gin mode
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize Gin router
	router := gin.Default()

	// Global middleware
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(middleware.ErrorHandler())
	router.Use(middleware.LoggerMiddleware())

	// Setup routes
	routes.SetupRoutes(router)

	// Start server
	address := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Server starting on http://localhost%s", address)
	log.Printf("📝 Environment: %s", cfg.Server.Env)
	log.Printf("📊 Database: %s", cfg.Database.DBName)

	if err := router.Run(address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
