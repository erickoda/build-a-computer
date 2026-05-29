package entities

import (
	"time"

	"github.com/google/uuid"
)

type Game struct {
	ID          	uuid.UUID   `gorm:"type:uuid;primaryKey"`
	Name          	string 		`gorm:"type:varchar(1024);not null"`
	Img           	[]byte 		`gorm:"type:bytea"`
	NecessaryDisk 	int32 		`gorm:"type:integer;not null"`
	AvgFps       	int32 		`gorm:"type:integer"`
	CreatedAt    	time.Time 	`gorm:"type:timestamp;not null"`
	UpdatedAt    	time.Time 	`gorm:"type:timestamp"`
}
