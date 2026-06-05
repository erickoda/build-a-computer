package enums

import (
	"database/sql/driver"
	"fmt"
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

func (psur *PowerSourceRanking) Scan(value any) error {
	if value == nil{
		return fmt.Errorf("can not scan a nil value")
	}

	switch v := value.(type) {
	case string:
		*psur = PowerSourceRanking(v)
	case []byte:
		sv := string(v)
		*psur = PowerSourceRanking(sv)
	default:
		return fmt.Errorf("failed to scan psu ranking: %v", value)
	}
	
	return nil
}

func (psur PowerSourceRanking) Value() (driver.Value, error) {
	return string(psur), nil
}