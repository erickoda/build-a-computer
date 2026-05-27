package domain

import (
	"time"

	"github.com/google/uuid"
)

type Game struct {
	ID          uuid.UUID   `gorm:"primaryKey"`
	Name        string `gorm:"not null"`
	Img 		[]byte `gorm:""`
	CreatedAt   time.Time `gorm:"not null"`
}
