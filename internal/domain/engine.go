
package domain

import "errors"


const (
	SideBuy  = "BUY"
	SideSell = "SELL"
)

var (
	errSide       = errors.New("invalid side: must be BUY or SELL")
	errQty        = errors.New("qty must be > 0")
	errInsufCash  = errors.New("insufficient cash for buy")
	errInsufPos   = errors.New("insufficient position for sell")
)


func SignedQty(side string, qty float64) (float64, error) {
	if qty <= 0 { return 0, errQty }
	switch side {
	case SideBuy:
		return qty, nil
	case SideSell:
		return -qty, nil
	default:
		return 0, errSide
	}
}



func TradeCost(side string, qty, p float64) (float64, error) {
	q, err := SignedQty(side, qty)
	if err != nil { return 0, err }
	return -q * p, nil 
}


func ValidateBalance(side string, qty, p float64, cash float64, posQty float64) error {
	switch side {
	case SideBuy:
		need := qty * p
		if cash+1e-9 < need { return errInsufCash }
	case SideSell:
		if posQty+1e-9 < qty { return errInsufPos }
	default:
		return errSide
	}
	return nil
}


func UpdatePosition(side string, qty, price float64, posQty, posAvg float64) (newQty, newAvg float64, realizedPnL float64, err error) {
	if qty <= 0 { return 0, 0, 0, errQty }
	switch side {
	case SideBuy:
		totalCost := posQty*posAvg + qty*price
		newQty = posQty + qty
		if newQty > 0 { newAvg = totalCost / newQty } else { newAvg = 0 }
		return newQty, newAvg, 0, nil
	case SideSell:
		if posQty+1e-9 < qty { return 0, 0, 0, errInsufPos }
		newQty = posQty - qty
		
		realizedPnL = (price - posAvg) * qty
		newAvg = posAvg 
		if newQty == 0 { newAvg = 0 } 
		return newQty, newAvg, realizedPnL, nil
	default:
		return 0, 0, 0, errSide
	}
}
