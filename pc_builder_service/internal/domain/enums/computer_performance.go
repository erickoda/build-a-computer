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

	sv, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan performance: %v", value)
	}
	*p = ComputerPerformance(sv)
	return nil
}

func (p ComputerPerformance) Value() (driver.Value, error) {
	return string(p), nil
}
