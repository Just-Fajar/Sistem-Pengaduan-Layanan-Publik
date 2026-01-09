package models

import (
	"time"

	"gorm.io/gorm"
)

type ComplaintStatus string

const (
	StatusPending    ComplaintStatus = "pending"
	StatusProcessing ComplaintStatus = "processing"
	StatusCompleted  ComplaintStatus = "completed"
)

type Complaint struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	UserID      uint            `gorm:"not null;index" json:"user_id"`
	CategoryID  uint            `gorm:"not null;index" json:"category_id"`
	Title       string          `gorm:"type:varchar(200);not null" json:"title"`
	Description string          `gorm:"type:text;not null" json:"description"`
	PhotoURL    string          `gorm:"type:varchar(255)" json:"photo_url"`
	Status      ComplaintStatus `gorm:"type:enum('pending','processing','completed');default:'pending'" json:"status"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `gorm:"index" json:"-"`

	// Relations
	User      User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Category  Category   `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Responses []Response `gorm:"foreignKey:ComplaintID" json:"responses,omitempty"`
}

type CreateComplaintRequest struct {
	CategoryID  uint   `form:"category_id" binding:"required"`
	Title       string `form:"title" binding:"required,min=5,max=200"`
	Description string `form:"description" binding:"required,min=10"`
}

type UpdateStatusRequest struct {
	Status ComplaintStatus `json:"status" binding:"required,oneof=pending processing completed"`
}

type ComplaintResponse struct {
	ID          uint              `json:"id"`
	UserID      uint              `json:"user_id"`
	CategoryID  uint              `json:"category_id"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	PhotoURL    string            `json:"photo_url,omitempty"`
	Status      ComplaintStatus   `json:"status"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
	User        *UserResponse     `json:"user,omitempty"`
	Category    *CategoryResponse `json:"category,omitempty"`
	Responses   []ResponseItem    `json:"responses,omitempty"`
}

// ToComplaintResponse converts Complaint to ComplaintResponse
func (c *Complaint) ToComplaintResponse() ComplaintResponse {
	response := ComplaintResponse{
		ID:          c.ID,
		UserID:      c.UserID,
		CategoryID:  c.CategoryID,
		Title:       c.Title,
		Description: c.Description,
		PhotoURL:    c.PhotoURL,
		Status:      c.Status,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}

	// Include user if loaded
	if c.User.ID != 0 {
		userResp := c.User.ToUserResponse()
		response.User = &userResp
	}

	// Include category if loaded
	if c.Category.ID != 0 {
		categoryResp := c.Category.ToCategoryResponse()
		response.Category = &categoryResp
	}

	// Include responses if loaded
	if len(c.Responses) > 0 {
		response.Responses = make([]ResponseItem, len(c.Responses))
		for i, r := range c.Responses {
			response.Responses[i] = r.ToResponseItem()
		}
	}

	return response
}
