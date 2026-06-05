package models

import (
	"time"

	"github.com/google/uuid"
)

type PowerSource struct {
	ID 					uuid.UUID 		`gorm:"type:uuid;primaryKey"`
	Brand 				string 			`gorm:"type:varchar(255);not null"`
	PowerAmount 		int32 			`gorm:"type:integer;not null"`
	Ranking 			string 			`gorm:"type:varchar(255);not null"`
	EightyPlusCert 		bool 			`gorm:"type:boolean;not null"`
	AvgPrice 			float32 		`gorm:"type:real;not null"`
	Img 				[]byte 			`gorm:"type:bytea"`
	CreatedAt 			time.Time 		`gorm:"type:timestamp;not null"`
	UpdatedAt 			time.Time 		`gorm:"type:timestamp"`
}