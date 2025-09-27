
package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`  
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"` 
	Username  string             `bson:"username" json:"username"`
	PasswordH string             `bson:"passwordH" json:"-"`      
	Cash      int64              `bson:"cash" json:"cash"`           
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}
