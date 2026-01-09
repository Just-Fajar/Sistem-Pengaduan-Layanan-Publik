package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaginationParams struct {
	Page     int
	PageSize int
	Offset   int
}

type PaginationResult struct {
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalRows  int64       `json:"total_rows"`
	TotalPages int         `json:"total_pages"`
	Data       interface{} `json:"data"`
}

// GetPaginationParams extracts pagination params from request
func GetPaginationParams(c *gin.Context) PaginationParams {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100 // Max 100 items per page
	}

	offset := (page - 1) * pageSize

	return PaginationParams{
		Page:     page,
		PageSize: pageSize,
		Offset:   offset,
	}
}

// Paginate applies pagination to query
func Paginate(params PaginationParams) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Offset(params.Offset).Limit(params.PageSize)
	}
}

// BuildPaginationResult builds pagination result
func BuildPaginationResult(page, pageSize int, totalRows int64, data interface{}) PaginationResult {
	totalPages := int(totalRows) / pageSize
	if int(totalRows)%pageSize > 0 {
		totalPages++
	}

	return PaginationResult{
		Page:       page,
		PageSize:   pageSize,
		TotalRows:  totalRows,
		TotalPages: totalPages,
		Data:       data,
	}
}
