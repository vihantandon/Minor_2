package entity

import "gorm.io/gorm"

type Role int

const (
	USER Role = iota
	ADMIN
)

type User struct {
	gorm.Model
	Username     string `gorm:"unique;not null"`
	Email        string `gorm:"unique;not null"`
	PasswordHash string `gorm:"not null"`
	Role         Role   `gorm:"default:0"`
	Score        int    `gorm:"default:0"`
}
