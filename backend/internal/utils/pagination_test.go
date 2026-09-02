package utils_test

import (
	"backend/internal/utils"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPagination_BuildPaginationResult(t *testing.T) {
	tests := []struct {
		name               string
		page               int
		pageSize           int
		totalRows          int64
		expectedTotalPages int
	}{
		{
			name:               "Exact division",
			page:               1,
			pageSize:           10,
			totalRows:          30,
			expectedTotalPages: 3,
		},
		{
			name:               "Remainder division (ceil)",
			page:               1,
			pageSize:           10,
			totalRows:          25,
			expectedTotalPages: 3,
		},
		{
			name:               "Empty records",
			page:               1,
			pageSize:           10,
			totalRows:          0,
			expectedTotalPages: 0,
		},
		{
			name:               "Single page with fewer items than pageSize",
			page:               1,
			pageSize:           10,
			totalRows:          5,
			expectedTotalPages: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dummyData := []string{"item1", "item2"}
			result := utils.BuildPaginationResult(tt.page, tt.pageSize, tt.totalRows, dummyData)

			assert.Equal(t, tt.page, result.Page)
			assert.Equal(t, tt.pageSize, result.PageSize)
			assert.Equal(t, tt.totalRows, result.TotalRows)
			assert.Equal(t, tt.expectedTotalPages, result.TotalPages)
			assert.Equal(t, dummyData, result.Data)
		})
	}
}
