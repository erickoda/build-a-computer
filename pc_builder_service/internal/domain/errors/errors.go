package domain

import "errors"

var (
	ErrGameNotFound       					= errors.New("none game was found")
	ErrBenchmarkNotFound  					= errors.New("none benchmark was found")
	ErrCPUNotFound							= errors.New("none cpu was found")
	ErrGPUNotFound							= errors.New("none gpu was found")
	ErrMotherBoardNotFound					= errors.New("none mother board was found")
	ErrRAMNotFound							= errors.New("none ram was found")
	ErrSSDNotFound							= errors.New("none ssd was found")
	
	ErrInternalDatabaseError 				= errors.New("internal database error")

	ErrInvalidUUID 							= errors.New("invalid uuid format")

	ErrTimedOut 							= errors.New("operation timed out")
	ErrCanceled 							= errors.New("operation canceled")

	ErrInvalidSizeOfMotherBoardSettings 	= errors.New("socket and ddr slices must have the same length")

	ErrPerformanceParseError 				= errors.New("can not parse performance string")
	ErrPowerSourceRankingParseError 		= errors.New("can not parse power source ranking string")
	ErrSSDTypeParseError 					= errors.New("can not parse ssd type string")

	ErrInvalidPerformanceScan 				= errors.New("invalid performance scan")
	ErrInvalidPowerSourceScan 				= errors.New("invalid power source scan")
	ErrInvalidSSDTypeScan 					= errors.New("invalid ssd type scan")
	ErrScanNilValue 						= errors.New("scan value is nil")
)