
package domain

import "math"


type ImpactParams struct {
	Alpha     float64 
	BetaEMA   float64 
	ClampDown float64 
	ClampUp   float64 
}

func DefaultImpact() ImpactParams {
	return ImpactParams{
		Alpha:     0.02,
		BetaEMA:   0.2,
		ClampDown: 0.10,
		ClampUp:   0.10,
	}
}



func ApplyImpact(p, q, L float64, ip ImpactParams) float64 {
	if L <= 0 {
		L = 1 
	}
	impact := ip.Alpha * (q / L)
	proposed := p * (1 + impact)
	minP := p * (1 - ip.ClampDown)
	maxP := p * (1 + ip.ClampUp)
	if proposed < minP { return minP }
	if proposed > maxP { return maxP }
	return proposed
}


func NextEMA(prevEMA, price, beta float64) float64 {
	beta = math.Max(0, math.Min(1, beta))
	return beta*price + (1-beta)*prevEMA
}
