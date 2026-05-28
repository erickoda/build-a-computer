package enums

import (
	"database/sql/driver"
	"fmt"
)

type Performance string

const (
	PerformanceLow 		Performance = "low"
	PerformanceMedium 	Performance = "medium"
	PerformanceHigh 	Performance = "high"
	PerformanceUltra 	Performance = "ultra"
)

func (p *Performance) Scan(value interface{}) error {
	if value == nil{
		return fmt.Errorf("can not scan a nil value")
	}

	sv, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan performance: %v", value)
	}
	*p = Performance(sv)
	return nil
}

func (p Performance) Value() (driver.Value, error) {
	return string(p), nil
}
