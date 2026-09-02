package utils_test

import (
	"backend/internal/utils"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewEmailService_Defaults(t *testing.T) {
	service := utils.NewEmailService()
	assert.NotNil(t, service)
	assert.NotEmpty(t, service.SMTPHost)
	assert.Equal(t, "465", service.SMTPPort)
}

func TestEmailService_SendEmail_Unconfigured(t *testing.T) {
	service := &utils.EmailService{
		SMTPHost: "smtp.gmail.com",
		SMTPPort: "465",
		From:     "", // unconfigured
		Password: "",
	}

	// Should safely return nil without attempting network connection
	err := service.SendEmail("user@example.com", "Test Subject", "Test Body")
	assert.NoError(t, err)

	err = service.SendStatusUpdateNotification("user@example.com", "Budi", "Jalan Rusak", "pending", "processing")
	assert.NoError(t, err)

	err = service.SendResponseNotification("user@example.com", "Budi", "Jalan Rusak", "Tim kami sedang menuju lokasi")
	assert.NoError(t, err)
}
