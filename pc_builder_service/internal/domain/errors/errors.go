package domain

import "errors"

var (
	ErrGameNotFound       = errors.New("none game was found")
	ErrBenchmarkNotFound  = errors.New("none benchmark was found")
	ErrInternalDatabaseError = errors.New("internal database error")

	ErrInvalidUUID = errors.New("invalid uuid format")

	ErrTimedOut = errors.New("operation timed out")
	ErrCanceled = errors.New("operation canceled")
)