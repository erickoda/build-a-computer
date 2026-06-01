package db

import (
	"errors"
	"strings"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/errors"
	"gorm.io/gorm"
)

func HandleError(err error) error {
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
		if strings.Contains(err.Error(), "benchmark") {
			return domain.ErrBenchmarkNotFound
		}
		if strings.Contains(err.Error(), "game") {
			return domain.ErrGameNotFound
		}
	}

	return domain.ErrInternalDatabaseError
}