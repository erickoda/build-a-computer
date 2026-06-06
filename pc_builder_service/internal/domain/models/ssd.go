package models

import (
	"time"

	"github.com/google/uuid"

	e "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/enums"
)

type SSD struct {
	ID          		uuid.UUID 			`gorm:"type:uuid;primaryKey"`
	Brand       		string				`gorm:"type:varchar(255);not null"`
	Series      		string				`gorm:"type:varchar(255);not null"`
	Amount   			int32				`gorm:"type:integer;not null"`
	Type        		e.SSDType			`gorm:"column:type;type:ssd_type;not null"`
	Reading     		int32				`gorm:"type:integer;not null"`
	Writing     		int32				`gorm:"type:integer;not null"`
	AvgPrice			float32				`gorm:"type:real;not null"`
	Score				int32				`gorm:"type:integer"`
	Img 				[]byte 				`gorm:"type:bytea"`
	CreatedAt 			time.Time 			`gorm:"type:timestamp;not null"`
	UpdatedAt 			time.Time 			`gorm:"type:timestamp"`
}
