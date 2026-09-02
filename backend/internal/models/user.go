package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null" json:"name" binding:"required"`
	Email     string         `gorm:"type:varchar(100);unique;not null" json:"email" binding:"required,email"`
	Password  string         `gorm:"type:varchar(255);not null" json:"-"`
	Phone                  string         `gorm:"type:varchar(20)" json:"phone"`
	Role                   string         `gorm:"type:varchar(20);default:'user'" json:"role"`
	ResetPasswordToken     *string        `gorm:"type:varchar(255);index" json:"-"`
	ResetPasswordExpiresAt *time.Time     `json:"-"`
	CreatedAt              time.Time      `json:"created_at"`
	UpdatedAt              time.Time      `json:"updated_at"`
	DeletedAt              gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Complaints []Complaint `gorm:"foreignKey:UserID" json:"complaints,omitempty"`
	Responses  []Response  `gorm:"foreignKey:AdminID" json:"responses,omitempty"`
}

type UserRegisterRequest struct {
	Name     string `json:"name" binding:"required,min=3,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone" binding:"required,min=10,max=20"`
}

type UserLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type UpdateProfileRequest struct {
	Name  string `json:"name" binding:"required,min=3,max=100"`
	Phone string `json:"phone" binding:"required,min=10,max=20"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// HashPassword hashes the password using bcrypt
func (u *User) HashPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword compares password with hashed password
func (u *User) CheckPassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}

// ToUserResponse converts User to UserResponse
func (u *User) ToUserResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Phone:     u.Phone,
		Role:      u.Role,
		CreatedAt: u.CreatedAt,
	}
}

// IsAdmin checks if user is admin
func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}
