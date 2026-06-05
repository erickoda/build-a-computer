package models

import (
	"time"

	"github.com/google/uuid"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/errors"
)

type Game struct {
	ID 							uuid.UUID 					`gorm:"type:uuid;primaryKey"`
	Name 						string 						`gorm:"type:varchar(1024);not null"`
	Img 						[]byte 						`gorm:"type:bytea"`
	NecessaryDisk 				int32 						`gorm:"type:integer;not null"`
	AvgFps 						int32 						`gorm:"type:integer"`
	CreatedAt 					time.Time 					`gorm:"type:timestamp;not null"`
	UpdatedAt 					time.Time 					`gorm:"type:timestamp"`
}

func Parse_ID(ids ...string) ([]uuid.UUID, error) {
	var parsedIDs []uuid.UUID
	
	for _, id := range ids {
		parsedID, err := uuid.Parse(id)
		if err != nil {
			return nil, domain.ErrInvalidUUID
		}
		parsedIDs = append(parsedIDs, parsedID)
	}
	return parsedIDs, nil
}
