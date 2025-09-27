package main


import (
"context"
"net/http"
"os"
"os/signal"
"syscall"
"time"


"github.com/gin-gonic/gin"
"go.uber.org/zap"


"github.com/pri-m-05/emoji-exchange/internal/config"
"github.com/pri-m-05/emoji-exchange/internal/db"
apphttp "github.com/pri-m-05/emoji-exchange/internal/http"
"github.com/pri-m-05/emoji-exchange/internal/services"
)


func main() {

logger, _ := zap.NewProduction()
defer logger.Sync()



cfg, err := config.Load()
if err != nil {
logger.Fatal("config load failed", zap.Error(err))
}

client, mongoDB, err := db.Connect(context.Background(), cfg.MongoURI, cfg.MongoDBName)
if err != nil {
logger.Fatal("db connect failed", zap.Error(err))
}
defer client.Disconnect(context.Background())


userSvc := services.NewUserService(mongoDB, logger)


if err := userSvc.EnsureIndexes(context.Background()); err != nil {
logger.Fatal("ensure indexes failed", zap.Error(err))
}


r := gin.Default()
apphttp.RegisterRoutes(r, cfg, logger, userSvc)



srv := &http.Server{Addr: ":" + cfg.HTTPPort, Handler: r}
go func() {
logger.Info("http server starting", zap.String("port", cfg.HTTPPort))
if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
logger.Fatal("server error", zap.Error(err))
}
}()



quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit


ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
_ = srv.Shutdown(ctx)
}