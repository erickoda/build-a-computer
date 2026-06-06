package enums

import (
	"database/sql/driver"
	"fmt"
)

type SSDType string

const (
	SDDTypeSATA 	SSDType = "SATA"
	SDDTypeM2SATA 	SSDType = "M2 SATA"
	SDDTypeM2NVMe 	SSDType = "M2 NVMe"
)

func (st *SSDType) Scan(value any) error {
	if value == nil{
		return fmt.Errorf("can not scan a nil value")
	}

	switch v := value.(type) {
	case string:
		*st = SSDType(v)
	case []byte:
		sv := string(v)
		*st = SSDType(sv)
	default:
		return fmt.Errorf("failed to scan ssd type: %v", value)
	}
	
	return nil
}

func (st SSDType) Value() (driver.Value, error) {
	return string(st), nil
}