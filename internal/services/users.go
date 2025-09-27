
package services

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pri-m-05/emoji-exchange/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

type UserService struct {
	db  *mongo.Database
	log *zap.Logger
}

func NewUserService(db *mongo.Database, log *zap.Logger) *UserService {
	return &UserService{db: db, log: log}
}

var ErrUsernameTaken = errors.New("username already taken")

func (s *UserService) usersCol() *mongo.Collection { return s.db.Collection("users") }

func (s *UserService) EnsureIndexes(ctx context.Context) error {
	_, err := s.usersCol().Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}

type RegisterInput struct {
	Username string `json:"username" binding:"required,min=2,max=24"`
}

type AuthOutput struct {
	Token    string `json:"token"`
	UserID   string `json:"userId"`
	Username string `json:"username"`
	Cash     int64  `json:"cash"`
}

func (s *UserService) Register(ctx context.Context, username string, startingCash int64) (domain.User, error) {
	u := domain.User{
		ID:        primitive.NewObjectID(),
		Username:  username,
		Cash:      startingCash,
		CreatedAt: time.Now(),
	}
	_, err := s.usersCol().InsertOne(ctx, u)
	if err != nil {
		var we mongo.WriteException
		if errors.As(err, &we) {
			for _, e := range we.WriteErrors {
				if e.Code == 11000 {
					return domain.User{}, ErrUsernameTaken
				}
			}
		}
		return domain.User{}, err
	}
	return u, nil
}

func (s *UserService) FindByUsername(ctx context.Context, username string) (domain.User, error) {
	var u domain.User
	err := s.usersCol().FindOne(ctx, bson.M{"username": username}).Decode(&u)
	return u, err
}

func (s *UserService) FindByID(ctx context.Context, id string) (domain.User, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil { return domain.User{}, err }
	var u domain.User
	err = s.usersCol().FindOne(ctx, bson.M{"_id": oid}).Decode(&u)
	return u, err
}

func (s *UserService) MakeJWT(userID, username, secret string) (string, error) {
	claims := jwt.MapClaims{
		"userId":   userID,
		"username": username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}
