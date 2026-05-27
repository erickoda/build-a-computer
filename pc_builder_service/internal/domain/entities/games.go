package domain

import (
	"time"

	"github.com/google/uuid"
)

type Game struct {
	ID          	uuid.UUID   `gorm:"primaryKey"`
	Name          	string `gorm:"type:varchar(1024) not null"`
	Img           	[]byte `gorm:"type:bytea"`
	NecessaryDisk 	int32  `gorm:"not null"`
	CreatedAt    	time.Time `gorm:"not null"`
}
