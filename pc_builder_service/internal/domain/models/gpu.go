package models

import (
	"time"

	"github.com/google/uuid"
)


type GPU struct {
	ID 					uuid.UUID 				`gorm:"type:uuid;primaryKey"`
	Brand 				string 					`gorm:"type:varchar(50);not null"`
	Family 				string 					`gorm:"type:varchar(10);not null"`
	Series 				string 					`gorm:"type:varchar(20);not null"`
	MemoryAmount 		int32 					`gorm:"type:integer;not null"`
	MemoryGen 			string 					`gorm:"type:varchar(10);not null"`
	Cores 				int32 					`gorm:"type:integer;not null"`
	PciExpress 			int32 					`gorm:"column:pci_express;type:integer;not null"`
	RecommendedPower 	int32 					`gorm:"type:integer;not null"`
	ReleaseDate 		time.Time 				`gorm:"type:timestamp;not null"`
	AvgPrice 			float32 				`gorm:"type:real;not null"`
	Img 				[]byte 					`gorm:"type:bytea"`
	CreatedAt 			time.Time 				`gorm:"type:timestamp;not null"`
	UpdatedAt 			time.Time 				`gorm:"type:timestamp"`
}