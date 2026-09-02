package models_test

import (
	"backend/internal/models"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCategory_ToCategoryResponse(t *testing.T) {
	category := models.Category{
		ID:          5,
		Name:        "Kebersihan",
		Description: "Pengelolaan limbah dan sampah",
	}

	res := category.ToCategoryResponse()
	assert.Equal(t, uint(5), res.ID)
	assert.Equal(t, "Kebersihan", res.Name)
	assert.Equal(t, "Pengelolaan limbah dan sampah", res.Description)
}
