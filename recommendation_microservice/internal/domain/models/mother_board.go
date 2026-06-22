package models

import (
	"time"

	"github.com/google/uuid"
)

type MotherBoard struct {
	ID 								uuid.UUID 			`gorm:"type:uuid;primary_key"`
	Brand 							string 				`gorm:"type:varchar(255);not null"`
	Series 							string 				`gorm:"type:varchar(255);not null"`
	Socket 							string 				`gorm:"type:varchar(255);not null"`
	DDR 							string 				`gorm:"type:varchar(255);not null"`
	MemorySlots 					int32 				`gorm:"type:integer;not null"`
	MaxRam 							int32 				`gorm:"type:integer;not null"`
	MaxRamMemoryFrequencyMhz 		int32 				`gorm:"type:real;not null"`
	PciExpress 						int32 				`gorm:"column:pci_express;type:integer;not null"`
	M2Slots 						int32 				`gorm:"type:integer;not null"`
	Vrm 							int32 				`gorm:"type:integer;not null"`
	AvgPrice 						float32 			`gorm:"type:real;not null"`
	Score 							int32 				`gorm:"type:integer"`
	Img 							[]byte 				`gorm:"type:bytea"`
	CreatedAt 						time.Time 			`gorm:"type:timestamp;not null"`
	UpdatedAt 						time.Time 			`gorm:"type:timestamp"`
}
