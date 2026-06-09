package models

import (
	"time"

	"github.com/google/uuid"

	e "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/enums"
)

type PowerSource struct {
	ID 					uuid.UUID 					`gorm:"type:uuid;primaryKey"`
	Brand 				string 						`gorm:"type:varchar(255);not null"`
	Series 				string 						`gorm:"type:varchar(255);not null"`
	PowerAmount 		int32 						`gorm:"type:integer;not null"`
	Ranking 			e.PowerSourceRanking 		`gorm:"type:psu_ranking;not null"`
	EightyPlusCert 		bool 						`gorm:"type:boolean;not null"`
	AvgPrice 			float32 					`gorm:"type:real;not null"`
	Score 				int32 						`gorm:"type:integer"`
	Img 				[]byte 						`gorm:"type:bytea"`
	CreatedAt 			time.Time 					`gorm:"type:timestamp;not null"`
	UpdatedAt 			time.Time 					`gorm:"type:timestamp"`
}