package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
	Server   ServerConfig
	JWT      JWTConfig
	Upload   UploadConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type ServerConfig struct {
	Port          string
	Env           string
	AllowedOrigin string
}

type JWTConfig struct {
	Secret      string
	ExpireHours int
}

type UploadConfig struct {
	Path        string
	MaxFileSize int64
}

var AppConfig *Config

func LoadConfig() (*Config, error) {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	expireHours, _ := strconv.Atoi(GetEnv("JWT_EXPIRE_HOURS", "24"))
	maxFileSize, _ := strconv.ParseInt(GetEnv("MAX_FILE_SIZE", "5242880"), 10, 64)

	config := &Config{
		Database: DatabaseConfig{
			Host:     GetEnv("DB_HOST", "localhost"),
			Port:     GetEnv("DB_PORT", "3306"),
			User:     GetEnv("DB_USER", "root"),
			Password: GetEnv("DB_PASSWORD", ""),
			DBName:   GetEnv("DB_NAME", "pengaduan_db"),
		},
		Server: ServerConfig{
			Port:          GetEnv("PORT", "8080"),
			Env:           GetEnv("ENV", "development"),
			AllowedOrigin: GetEnv("ALLOWED_ORIGIN", "http://localhost:3000"),
		},
		JWT: JWTConfig{
			Secret:      GetEnv("JWT_SECRET", "default-secret-key"),
			ExpireHours: expireHours,
		},
		Upload: UploadConfig{
			Path:        GetEnv("UPLOAD_PATH", "./uploads"),
			MaxFileSize: maxFileSize,
		},
	}

	// Security validation for JWT secret
	if config.Server.Env == "production" && (config.JWT.Secret == "" || config.JWT.Secret == "default-secret-key") {
		return nil, fmt.Errorf("FATAL: JWT_SECRET must be explicitly configured in production environment")
	}
	if config.JWT.Secret == "default-secret-key" {
		log.Println("WARNING: Using default JWT secret. Please set a secure JWT_SECRET in .env for production.")
	}

	AppConfig = config
	return config, nil
}

func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.User, c.Password, c.Host, c.Port, c.DBName)
}

// GetEnv retrieves environment variable or fallback to default value
func GetEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
