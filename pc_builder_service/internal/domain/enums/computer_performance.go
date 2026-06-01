package enums

import (
	"database/sql/driver"
	"fmt"
)

type ComputerPerformance string

const (
	ComputerPerformanceLow 		ComputerPerformance = "low"
	ComputerPerformanceMedium 	ComputerPerformance = "medium"
	ComputerPerformanceHigh 	ComputerPerformance = "high"
	ComputerPerformanceUltra 	ComputerPerformance = "ultra"
)

func (p *ComputerPerformance) Scan(value any) error {
	if value == nil{
		return fmt.Errorf("can not scan a nil value")
	}

	switch v := value.(type) {
	case string:
		*p = ComputerPerformance(v)
	case []byte:
		sv := string(v)
		*p = ComputerPerformance(sv)
	default:
		return fmt.Errorf("failed to scan performance: %v", value)
	}
	
	return nil
}

func (p ComputerPerformance) Value() (driver.Value, error) {
	return string(p), nil
}
