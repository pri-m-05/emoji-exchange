
package db

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)
func Connect(ctx context.Context, uri, dbName string) (*mongo.Client, *mongo.Database, error) {
	
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, nil, err
	}

	
	ctx2, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	
	if err := client.Ping(ctx2, nil); err != nil {
		return nil, nil, err
	}

	
	return client, client.Database(dbName), nil
}
