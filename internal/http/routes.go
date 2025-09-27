
package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/pri-m-05/emoji-exchange/internal/config"
	"github.com/pri-m-05/emoji-exchange/internal/services"
)

 type deps struct {
	cfg   config.Config
	log   *zap.Logger
	users *services.UserService
}

func RegisterRoutes(r *gin.Engine, cfg config.Config, log *zap.Logger, userSvc *services.UserService) {
	d := &deps{cfg: cfg, log: log, users: userSvc}

	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })

	auth := r.Group("/auth")
	{
		auth.POST("/register", d.handleRegister)
		auth.POST("/login", d.handleLogin)
	}

	api := r.Group("/api", AuthMiddleware(AuthConfig{JWTSecret: cfg.JWTSecret}))
	{
		api.GET("/me", d.handleMe)
	}
}

func (d *deps) handleRegister(c *gin.Context) {
	var in services.RegisterInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	u, err := d.users.Register(c.Request.Context(), in.Username, d.cfg.StartingCash)
	if err != nil {
		if err == services.ErrUsernameTaken {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	tok, err := d.users.MakeJWT(u.ID.Hex(), u.Username, d.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, services.AuthOutput{Token: tok, UserID: u.ID.Hex(), Username: u.Username, Cash: u.Cash})
}

func (d *deps) handleLogin(c *gin.Context) {
	var in services.RegisterInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	u, err := d.users.FindByUsername(c.Request.Context(), in.Username)
	if err != nil {
		u, err = d.users.Register(c.Request.Context(), in.Username, d.cfg.StartingCash)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	tok, err := d.users.MakeJWT(u.ID.Hex(), u.Username, d.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, services.AuthOutput{Token: tok, UserID: u.ID.Hex(), Username: u.Username, Cash: u.Cash})
}

func (d *deps) handleMe(c *gin.Context) {
	userID := c.GetString("userId")
	u, err := d.users.FindByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": u.ID.Hex(), "username": u.Username, "cash": u.Cash})
}
