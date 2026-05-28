package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RamMemory struct {
	gorm.Model
	
	ID uuid.UUID `gorm:"type:uuid not null"`
	Brand string `gorm:"type:varchar(255) not null"`
	MemoryAmount int32 `gorm:"type:integer not null"`
	FrequencyMhz int32 `gorm:"type:integer not null"`
	Series string `gorm:"type:varchar(255) not null"`
	AvgPrice float32 `gorm:"type:float not null"`
	Img []byte `gorm:"type:bytea"`
	CreatedAt time.Time `gorm:"type:timestamp not null"`
	UpdatedAt time.Time `gorm:"type:timestamp"`
}