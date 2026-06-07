package enums

import (
	"database/sql/driver"

	domain "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/errors"
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

func ParsePowerSourceRanking(ranking string) (PowerSourceRanking, error) {
	if _, ok := ValidPowerSourceRanking[ranking]; !ok {
		return "", domain.ErrPowerSourceRankingParseError
	}
	return ValidPowerSourceRanking[ranking], nil
}

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

func (psur PowerSourceRanking) Value() (driver.Value, error) {
	return string(psur), nil
}