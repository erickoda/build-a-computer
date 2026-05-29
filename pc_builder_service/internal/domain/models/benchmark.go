package models

import (
	"time"

	e "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/enums"
	"github.com/google/uuid"
)

type Benchmark struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title string `gorm:"type:varchar(255);not null"`
	Resolution int32 `gorm:"type:integer;not null"`
	ComputerPerformance e.ComputerPerformance `gorm:"type:performance;not null"`
	CPUId uuid.UUID `gorm:"type:uuid;not null"`
	GPUId uuid.UUID `gorm:"type:uuid"`
	RAMId uuid.UUID `gorm:"type:uuid;not null"`
	AvgFps int32 `gorm:"type:integer;not null"`
	MaxFps int32 `gorm:"type:integer;not null"`
	MinFps int32 `gorm:"type:integer;not null"`
	GameId uuid.UUID `gorm:"type:uuid;not null"`
	UserId uuid.UUID `gorm:"type:uuid;not null"`
	Score int32 `gorm:"type:integer"`
	CreatedAt time.Time `gorm:"type:timestamp;not null"`
	UpdatedAt time.Time `gorm:"type:timestamp"`
}
