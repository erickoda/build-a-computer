package enums

type Performance int32

const (
	PerformanceLow Performance = iota
	PerformanceMedium
	PerformanceHigh
	PerformanceUltra
)

var peformance_name = map[Performance]string{
	PerformanceLow:     "Low",
	PerformanceMedium:  "Medium",
	PerformanceHigh:    "High",
	PerformanceUltra:   "Ultra",
}

func (p Performance) String() string {
	return peformance_name[p]
}
