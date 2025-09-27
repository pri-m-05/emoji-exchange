
package services

import (
	"context"
	"errors"
	"time"

	"github.com/pri-m-05/emoji-exchange/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)


type TradeService struct {
	db  *mongo.Database
	log *zap.Logger
}

func NewTradeService(db *mongo.Database, log *zap.Logger) *TradeService {
	return &TradeService{db: db, log: log}
}


func (s *TradeService) colAssets() *mongo.Collection   { return s.db.Collection("assets") }
func (s *TradeService) colUsers() *mongo.Collection    { return s.db.Collection("users") }
func (s *TradeService) colPositions() *mongo.Collection{ return s.db.Collection("positions") }
func (s *TradeService) colTrades() *mongo.Collection   { return s.db.Collection("trades") }


func (s *TradeService) EnsureIndexes(ctx context.Context) error {
	_, err := s.colAssets().Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "code", Value: 1}}, Options: options.Index().SetUnique(true)},
	})
	if err != nil { return err }
	_, err = s.colPositions().Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "userId", Value: 1}, {Key: "assetCode", Value: 1}}, Options: options.Index().SetUnique(true)},
	})
	return err
}


type AssetOut struct {
	Code      string  `json:"code"`
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	EMA       float64 `json:"ema"`
	Liquidity float64 `json:"liquidity"`
}


func (s *TradeService) ListAssets(ctx context.Context) ([]AssetOut, error) {
	cur, err := s.colAssets().Find(ctx, bson.M{})
	if err != nil { return nil, err }
	defer cur.Close(ctx)
	var out []AssetOut
	for cur.Next(ctx) {
		var a domain.Asset
		if err := cur.Decode(&a); err != nil { return nil, err }
		out = append(out, AssetOut{Code: a.Code, Symbol: a.Symbol, Price: a.Price, EMA: a.EMA, Liquidity: a.Liquidity})
	}
	return out, cur.Err()
}


type TradeInput struct {
	UserID    string  `json:"userId"`
	AssetCode string  `json:"assetCode"` 
	Side      string  `json:"side"`      
	Qty       float64 `json:"qty"`       
}


type TradeResult struct {
	AssetCode string  `json:"assetCode"`
	Side      string  `json:"side"`
	Qty       float64 `json:"qty"`
	Price     float64 `json:"price"`
	NewPrice  float64 `json:"newPrice"`
	EMA       float64 `json:"ema"`
	Cash      float64 `json:"cash"`
	PosQty    float64 `json:"posQty"`
	PosAvg    float64 `json:"posAvg"`
}

var (
	errNoSuchAsset = errors.New("asset not found")
	errNoSuchUser  = errors.New("user not found")
)


func (s *TradeService) Trade(ctx context.Context, in TradeInput, ip domain.ImpactParams) (TradeResult, error) {
	var res TradeResult

	
	sess, err := s.db.Client().StartSession()
	if err != nil { return res, err }
	defer sess.EndSession(ctx)

	fn := func(sc mongo.SessionContext) (interface{}, error) {
		
		var user struct{ ID string `bson:"_id"`; Cash float64 `bson:"cash"` }
		if err := s.colUsers().FindOne(sc, bson.M{"_id": in.UserID}).Decode(&user); err != nil {
			return nil, errNoSuchUser
		}

		
		var asset domain.Asset
		if err := s.colAssets().FindOne(sc, bson.M{"code": in.AssetCode}).Decode(&asset); err != nil {
			return nil, errNoSuchAsset
		}

		
		var pos struct{ Qty float64 `bson:"qty"`; Avg float64 `bson:"avgPrice"` }
		err := s.colPositions().FindOne(sc, bson.M{"userId": in.UserID, "assetCode": in.AssetCode}).Decode(&pos)
		if err == mongo.ErrNoDocuments { pos = struct{Qty float64 `bson:"qty"`; Avg float64 `bson:"avgPrice"`}{0,0}; err = nil }
		if err != nil { return nil, err }

		
		if err := domain.ValidateBalance(in.Side, in.Qty, asset.Price, user.Cash, pos.Qty); err != nil { return nil, err }

		
		signedQty, err := domain.SignedQty(in.Side, in.Qty)
		if err != nil { return nil, err }
		newPrice := domain.ApplyImpact(asset.Price, signedQty, asset.Liquidity, ip)
		ema := domain.NextEMA(asset.EMA, newPrice, ip.BetaEMA)

		
		cashDelta, err := domain.TradeCost(in.Side, in.Qty, newPrice)
		if err != nil { return nil, err }
		newCash := user.Cash + cashDelta
		if newCash < -1e-6 { return nil, domain.ErrInsufCash }

		
		newQty, newAvg, _, err := domain.UpdatePosition(in.Side, in.Qty, newPrice, pos.Qty, pos.Avg)
		if err != nil { return nil, err }

		
		
		if _, err := s.colAssets().UpdateOne(sc, bson.M{"code": in.AssetCode}, bson.M{"$set": bson.M{"price": newPrice, "ema": ema, "updatedAt": time.Now()}}); err != nil { return nil, err }
		
		if _, err := s.colUsers().UpdateOne(sc, bson.M{"_id": in.UserID}, bson.M{"$set": bson.M{"cash": newCash}}); err != nil { return nil, err }
		
		if _, err := s.colPositions().UpdateOne(sc,
			bson.M{"userId": in.UserID, "assetCode": in.AssetCode},
			bson.M{"$set": bson.M{"qty": newQty, "avgPrice": newAvg, "updatedAt": time.Now()}},
			options.Update().SetUpsert(true)); err != nil { return nil, err }
		
		if _, err := s.colTrades().InsertOne(sc, bson.M{
			"userId": in.UserID,
			"assetCode": in.AssetCode,
			"side": in.Side,
			"qty": in.Qty,
			"price": newPrice,
			"value": newPrice * in.Qty,
			"createdAt": time.Now(),
		}); err != nil { return nil, err }

		res = TradeResult{
			AssetCode: in.AssetCode,
			Side:      in.Side,
			Qty:       in.Qty,
			Price:     newPrice,
			NewPrice:  newPrice,
			EMA:       ema,
			Cash:      newCash,
			PosQty:    newQty,
			PosAvg:    newAvg,
		}
		return res, nil
	}

	out, err := sess.WithTransaction(ctx, fn)
	if err != nil { return res, err }
	return out.(TradeResult), nil
}
