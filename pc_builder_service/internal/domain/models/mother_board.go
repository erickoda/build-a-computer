package models

import (
	"time"

	"github.com/google/uuid"
)

type MotherBoard struct {
	ID uuid.UUID `gorm:"type:uuid;primary_key"`
	Brand string `gorm:"type:varchar(255);not null"`
	Series string `gorm:"type:varchar(255);not null"`
	Socket string `gorm:"type:varchar(31);not null"`
	PciExpress int32 `gorm:"column:pci_express;type:integer;not null"`
	DDR string `gorm:"type:varchar(255);not null"`
	AvgPrice float32 `gorm:"type:real;not null"`
	Img []byte `gorm:"type:bytea"`
	CreatedAt time.Time `gorm:"type:timestamp;not null"`
	UpdatedAt time.Time `gorm:"type:timestamp"`
}
