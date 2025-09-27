package config

import (
	"github.com/caarlos0/env/v11"
)

type Config struct {
	HTTPPort     string `env:"HTTP_PORT,notEmpty"`
	JWTSecret    string `env:"JWT_SECRET,notEmpty"`
	MongoURI     string `env:"MONGO_URI,notEmpty"`  
	MongoDBName  string `env:"MONGO_DB,notEmpty"`  
	StartingCash int64  `env:"STARTING_CASH" envDefault:"100000"`
}


func Load() (Config, error) {
	var c Config
	return c, env.Parse(&c)
}
