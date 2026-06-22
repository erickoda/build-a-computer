package enums

import (
	"database/sql/driver"

	domain "github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/errors"
)

type PowerSourceRanking string

const (
	PowerSourceRankingWhite 		PowerSourceRanking = "white"
	PowerSourceRankingBronze 		PowerSourceRanking = "bronze"
	PowerSourceRankingSilver 		PowerSourceRanking = "silver"
	PowerSourceRankingGold 			PowerSourceRanking = "gold"
	PowerSourceRankingPlatinum 		PowerSourceRanking = "platinum"
	PowerSourceRankingTitanium 		PowerSourceRanking = "titanium"
)

var ValidPowerSourceRanking = map[string]PowerSourceRanking{
	"white": PowerSourceRankingWhite,
	"bronze": PowerSourceRankingBronze,
	"silver": PowerSourceRankingSilver,
	"gold": PowerSourceRankingGold,
	"platinum": PowerSourceRankingPlatinum,
	"titanium": PowerSourceRankingTitanium,
}

// ParsePowerSourceRanking parses a string into a PowerSourceRanking value.
func ParsePowerSourceRanking(ranking string) (PowerSourceRanking, error) {
	if _, ok := ValidPowerSourceRanking[ranking]; !ok {
		return "", domain.ErrPowerSourceRankingParseError
	}
	return ValidPowerSourceRanking[ranking], nil
}

// Scan implements the scanner for gorm to convert a database value into a PowerSourceRanking.
func (psur *PowerSourceRanking) Scan(value any) error {
	if value == nil{
		return domain.ErrScanNilValue
	}

	switch v := value.(type) {
	case string:
		*psur = PowerSourceRanking(v)
	case []byte:
		sv := string(v)
		*psur = PowerSourceRanking(sv)
	default:
		return domain.ErrInvalidPowerSourceScan
	}
	
	return nil
}

// Value implements the driver to transform a PowerSourceRanking into a database value.
func (psur PowerSourceRanking) Value() (driver.Value, error) {
	return string(psur), nil
}