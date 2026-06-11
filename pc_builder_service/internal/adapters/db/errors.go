package db

import (
	"errors"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/errors"
	"gorm.io/gorm"
)

func HandleError(err error, entity string) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, domain.ErrCanceled) {
		return domain.ErrCanceled
	}

	if errors.Is(err, domain.ErrTimedOut) {
		return domain.ErrTimedOut
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		switch entity {
		case "benchmark":
			return domain.ErrBenchmarkNotFound
		case "game":
			return domain.ErrGameNotFound
		case "cpu":
			return domain.ErrCPUNotFound
		case "gpu":
			return domain.ErrGPUNotFound
		case "motherboard":
			return domain.ErrMotherBoardNotFound
		case "ram":
			return domain.ErrRAMNotFound
		case "ssd":
			return domain.ErrSSDNotFound
		}
		
	}

	return domain.ErrInternalDatabaseError
}