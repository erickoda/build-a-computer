package enums

import (
	"database/sql/driver"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/errors"
)

type ComputerPerformance string

const (
	ComputerPerformanceLow 		ComputerPerformance = "low"
	ComputerPerformanceMedium 	ComputerPerformance = "medium"
	ComputerPerformanceHigh 	ComputerPerformance = "high"
	ComputerPerformanceUltra 	ComputerPerformance = "ultra"
)

var validComputerPerformances = map[string]ComputerPerformance{
	"low":  ComputerPerformanceLow,
	"medium": ComputerPerformanceMedium,
	"high":  ComputerPerformanceHigh,
	"ultra": ComputerPerformanceUltra,
}

// ParseComputerPerformance parses a string into a ComputerPerformance value.
func ParseComputerPerformance(s string) (ComputerPerformance, error) {
	if p, ok := validComputerPerformances[s]; ok {
		return p, nil
	}
	return "", domain.ErrPerformanceParseError
}

// Scan implements the scanner for gorm to convert a database value into a ComputerPerformance.
func (p *ComputerPerformance) Scan(value any) error {
	if value == nil{
		return domain.ErrScanNilValue
	}

	switch v := value.(type) {
	case string:
		*p = ComputerPerformance(v)
	case []byte:
		sv := string(v)
		*p = ComputerPerformance(sv)
	default:
		return domain.ErrInvalidPerformanceScan
	}
	
	return nil
}

// Value implements the driver to transform a ComputerPerformance into a database value.
func (p ComputerPerformance) Value() (driver.Value, error) {
	return string(p), nil
}
