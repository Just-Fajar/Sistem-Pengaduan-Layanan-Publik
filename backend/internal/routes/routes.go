package routes

import (
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db ...*gorm.DB) {
	var gormDB *gorm.DB
	if len(db) > 0 && db[0] != nil {
		gormDB = db[0]
	} else {
		gormDB = database.DB
	}

	// Initialize Repositories
	userRepo := repository.NewUserRepository(gormDB)
	complaintRepo := repository.NewComplaintRepository(gormDB)
	categoryRepo := repository.NewCategoryRepository(gormDB)
	responseRepo := repository.NewResponseRepository(gormDB)

	// Initialize Services
	authService := service.NewAuthService(userRepo)
	profileService := service.NewProfileService(userRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	complaintService := service.NewComplaintService(complaintRepo, categoryRepo)
	adminService := service.NewAdminService(complaintRepo, userRepo, responseRepo)

	// Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService)
	complaintHandler := handlers.NewComplaintHandler(complaintService, categoryService)
	adminHandler := handlers.NewAdminHandler(adminService)
	profileHandler := handlers.NewProfileHandler(profileService)
	categoryHandler := handlers.NewCategoryHandler(categoryService, categoryRepo, complaintRepo)
	exportHandler := handlers.NewExportHandler(complaintRepo)

	// API v1 group
	api := router.Group("/api")
	{
		// Public routes - Auth
		auth := api.Group("/auth")
		{
			auth.POST("/register", middleware.AuthRateLimiter(), authHandler.Register)
			auth.POST("/login", middleware.AuthRateLimiter(), authHandler.Login)
		}

		// Protected routes - require authentication
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User profile
			protected.GET("/auth/me", authHandler.GetProfile)
			protected.PUT("/profile", profileHandler.UpdateProfile)
			protected.PUT("/profile/password", profileHandler.ChangePassword)

			// Categories (public for authenticated users)
			protected.GET("/categories", complaintHandler.GetCategories)

			// Complaints - User routes
			complaints := protected.Group("/complaints")
			{
				complaints.POST("", middleware.FileUploadMiddleware(), complaintHandler.CreateComplaint)
				complaints.GET("", complaintHandler.GetMyComplaints)
				complaints.GET("/:id", complaintHandler.GetComplaintDetail)
			}

			// Admin routes - require admin role
			admin := protected.Group("/admin")
			admin.Use(middleware.AdminMiddleware())
			{
				// Dashboard
				admin.GET("/statistics", adminHandler.GetDashboardStats)

				// Complaints management
				admin.GET("/complaints", adminHandler.GetAllComplaints)
				admin.GET("/complaints/:id", adminHandler.GetComplaintDetail)
				admin.PUT("/complaints/:id/status", adminHandler.UpdateComplaintStatus)
				admin.POST("/complaints/:id/response", adminHandler.AddResponse)

				// Categories management
				admin.GET("/categories", categoryHandler.GetAllCategories)
				admin.GET("/categories/:id", categoryHandler.GetCategoryDetail)
				admin.POST("/categories", categoryHandler.CreateCategory)
				admin.PUT("/categories/:id", categoryHandler.UpdateCategory)
				admin.DELETE("/categories/:id", categoryHandler.DeleteCategory)

				// Export
				admin.GET("/export/complaints/pdf", exportHandler.ExportComplaintsToPDF)
				admin.GET("/export/complaints/:id/pdf", exportHandler.ExportComplaintDetailToPDF)
			}
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// Serve uploaded files
	router.Static("/uploads", "./uploads")
}
