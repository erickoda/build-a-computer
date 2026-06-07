package enums

import (
	"database/sql/driver"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/errors"
)

type SSDType string

const (
	SDDTypeSATA 	SSDType = "SATA"
	SDDTypeM2SATA 	SSDType = "M2 SATA"
	SDDTypeM2NVMe 	SSDType = "M2 NVMe"
)

var ValidSSDType = map[string]SSDType{
	"sata": SDDTypeSATA,
	"m2 sata": SDDTypeM2SATA,
	"m2 nvme": SDDTypeM2NVMe,
}

func ParseSSDType(ssdType string) (SSDType, error) {
	if _, ok := ValidSSDType[ssdType]; !ok {
		return "", domain.ErrSSDTypeParseError
	}
	return ValidSSDType[ssdType], nil
}

func (st *SSDType) Scan(value any) error {
	if value == nil{
		return domain.ErrScanNilValue
	}

	switch v := value.(type) {
	case string:
		*st = SSDType(v)
	case []byte:
		sv := string(v)
		*st = SSDType(sv)
	default:
		return domain.ErrInvalidSSDTypeScan
	}
	
	return nil
}

func (st SSDType) Value() (driver.Value, error) {
	return string(st), nil
}