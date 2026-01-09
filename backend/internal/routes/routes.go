package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Initialize handlers
	authHandler := handlers.NewAuthHandler()
	complaintHandler := handlers.NewComplaintHandler()
	adminHandler := handlers.NewAdminHandler()
	profileHandler := handlers.NewProfileHandler()
	categoryHandler := handlers.NewCategoryHandler()
	exportHandler := handlers.NewExportHandler()

	// API v1 group
	api := router.Group("/api")
	{
		// Public routes - Auth
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
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
