package models

import (
	"time"

	"gorm.io/gorm"
)

type Response struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	ComplaintID  uint           `gorm:"not null;index" json:"complaint_id"`
	AdminID      uint           `gorm:"not null;index" json:"admin_id"`
	ResponseText string         `gorm:"type:text;not null" json:"response_text"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Complaint Complaint `gorm:"foreignKey:ComplaintID" json:"complaint,omitempty"`
	Admin     User      `gorm:"foreignKey:AdminID" json:"admin,omitempty"`
}

type CreateResponseRequest struct {
	ResponseText string `json:"response_text" binding:"required,min=10"`
}

type ResponseItem struct {
	ID           uint         `json:"id"`
	ComplaintID  uint         `json:"complaint_id"`
	ResponseText string       `json:"response_text"`
	CreatedAt    time.Time    `json:"created_at"`
	Admin        UserResponse `json:"admin,omitempty"`
}

// ToResponseItem converts Response to ResponseItem
func (r *Response) ToResponseItem() ResponseItem {
	item := ResponseItem{
		ID:           r.ID,
		ComplaintID:  r.ComplaintID,
		ResponseText: r.ResponseText,
		CreatedAt:    r.CreatedAt,
	}

	// Include admin info if loaded
	if r.Admin.ID != 0 {
		item.Admin = r.Admin.ToUserResponse()
	}

	return item
}
