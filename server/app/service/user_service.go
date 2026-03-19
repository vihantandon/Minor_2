package service

import (
	"errors"
	"olympiad/app/dto"
	"olympiad/app/entity"
	"olympiad/app/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUsernameTaken = errors.New("Username already taken")
	ErrEmailTaken    = errors.New("Email already registered")
	ErrInvalidCred   = errors.New("Invalid email or password")
	ErrUserNotFound  = errors.New("User not found")
)

// JWT Claims
type Claims struct {
	UserID uint        `json:"user_id"`
	Role   entity.Role `json:"role"`
	jwt.RegisteredClaims
}

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}
func (s *UserService) Register(req *dto.RegisterRequest) (*dto.AuthResponse, error) {
	//email uniqueness
	existing, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if existing != nil {
		return nil, ErrEmailTaken
	}

	//username uniqueness
	existingUsername, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		return nil, err
	}

	if existingUsername != nil {
		return nil, ErrUsernameTaken
	}

	//hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &entity.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hash),
		Role:         entity.USER,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	token, err := generateJWT(user)
	if err != nil {
		return nil, err
	}

	return buildAuthResponse(token, user), nil
}

func (s *UserService) Login(req *dto.LoginRequest) (*dto.AuthResponse, error) {

	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, ErrInvalidCred
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCred
	}

	token, err := generateJWT(user)
	if err != nil {
		return nil, err
	}

	return buildAuthResponse(token, user), nil
}

//Helper

func generateJWT(user *entity.User) (string, error) {
	secret := viper.GetString("jwt.secret")
	expHours := viper.GetInt("jwt.expiry_hours")

	if expHours == 0 {
		expHours = 72
	}

	claims := &Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.Email,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func buildAuthResponse(token string, user *entity.User) *dto.AuthResponse {
	return &dto.AuthResponse{
		Token: token,
		UserInfo: dto.UserInfoDTO{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			Role:     int(user.Role),
			Score:    user.Score,
		},
	}
}
