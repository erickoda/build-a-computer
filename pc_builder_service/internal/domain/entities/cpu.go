package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CPU struct {
	gorm.Model
	
	ID 					uuid.UUID 		`gorm:"type:uuid primaryKey"`
	Gen 				string 			`gorm:"type:varchar(10) not null"`
	Family 				string 			`gorm:"type:varchar(20) not null"`
	Series 				string 			`gorm:"type:varchar(20) not null"`
	Cores 				int32 			`gorm:"type:integer not null"`
	Threads 			int32 			`gorm:"type:integer not null"`
	BaseClock 			float32 		`gorm:"type:real not null"`
	MaxClock 			float32 		`gorm:"type:real not null"`
	Cache 				int32 			`gorm:"type:integer not null"`
	Socket 				string 			`gorm:"type:varchar(20) not null"`
	Graphics 			bool 			`gorm:"type:boolean not null"`
	OC 					bool 			`gorm:"type:boolean not null"`
	RecommendedPower 	int32 			`gorm:"type:integer not null"`
	ReleaseDate 		time.Time 		`gorm:"type:timestamp not null"`
	AvgPrice 			float32 		`gorm:"type:real not null"`
	Img 				[]byte 			`gorm:"type:bytea"`
	CreatedAt 			time.Time 		`gorm:"type:timestamp not null"`
	UpdatedAt 			time.Time 		`gorm:"type:timestamp"`
}
