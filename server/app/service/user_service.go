package service

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrUsernameTaken = errors.New("username already taken")
	ErrEmailTaken    = errors.New("email already registered")
	ErrInvalidCred   = errors.New("Invalid email or password")
	ErrUserNotFound  = errors.New("User not found")
)

//JWT Claims

type Claims struct {
	UserID uint `json:"user_id"`
	Role   int  `json:"role"`
	jwt.RegisteredClaims
}
