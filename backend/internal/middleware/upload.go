package middleware

import (
	"backend/internal/config"
	"backend/internal/utils"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// FileUploadMiddleware handles file upload with validation
func FileUploadMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get file from request
		file, err := c.FormFile("photo")
		if err != nil {
			// No file uploaded is ok, continue
			c.Next()
			return
		}

		// Validate file size
		if file.Size > config.AppConfig.Upload.MaxFileSize {
			utils.ErrorResponse(c, http.StatusBadRequest, "File size exceeds maximum limit (5MB)", nil)
			c.Abort()
			return
		}

		// Validate file type (only images)
		allowedTypes := map[string]bool{
			"image/jpeg": true,
			"image/jpg":  true,
			"image/png":  true,
			"image/gif":  true,
		}

		contentType := file.Header.Get("Content-Type")
		if !allowedTypes[contentType] {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid file type. Only JPEG, PNG, GIF allowed", nil)
			c.Abort()
			return
		}

		// Generate unique filename
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), generateRandomString(10), ext)

		// Create upload directory if not exists
		uploadPath := config.AppConfig.Upload.Path
		if err := os.MkdirAll(uploadPath, os.ModePerm); err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create upload directory", err.Error())
			c.Abort()
			return
		}

		// Save file
		filePath := filepath.Join(uploadPath, filename)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to save file", err.Error())
			c.Abort()
			return
		}

		// Store filename in context
		c.Set("uploaded_file", filename)
		c.Next()
	}
}

// generateRandomString generates random string for filename
func generateRandomString(length int) string {
	chars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = chars[time.Now().UnixNano()%int64(len(chars))]
	}
	return string(result)
}

// GetUploadedFilename retrieves uploaded filename from context
func GetUploadedFilename(c *gin.Context) string {
	if filename, exists := c.Get("uploaded_file"); exists {
		return filename.(string)
	}
	return ""
}

// DeleteFile deletes uploaded file
func DeleteFile(filename string) error {
	if filename == "" {
		return nil
	}

	filePath := filepath.Join(config.AppConfig.Upload.Path, filename)
	
	// Extract just the filename if it's a full URL
	if strings.Contains(filename, "/") {
		parts := strings.Split(filename, "/")
		filename = parts[len(parts)-1]
		filePath = filepath.Join(config.AppConfig.Upload.Path, filename)
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil
	}

	return os.Remove(filePath)
}
