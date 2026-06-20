import { BenchmarkCard } from '../benchmark-card/benchmark-card';
import type { BenchmarkResponseDto } from '../../types/dtos';
import type { Density } from './list-toolbar';
import { ListHeaderRow } from './list-header-row';

type BenchmarkResultsProps = {
  isLoading: boolean;
  error?: { message: string };
  benchmarks: BenchmarkResponseDto[];
  density: Density;
  gameName: (b: BenchmarkResponseDto) => string;
  selectedId: string | null;
  onToggleSelected: (id: string) => void;
};

export function BenchmarkResults({
  isLoading,
  error,
  benchmarks,
  density,
  gameName,
  selectedId,
  onToggleSelected,
}: BenchmarkResultsProps) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Loading benchmarks…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm font-medium">Failed to load benchmarks</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (benchmarks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm font-medium">No benchmarks match your filters</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting or clearing your filters.
        </p>
      </div>
    );
  }

  if (density === 'compact') {
    return (
      <div className="flex flex-col gap-0">
        <ListHeaderRow />
        <div className="flex flex-col gap-1 pt-1">
          {benchmarks.map((benchmark) => (
            <BenchmarkCard
              key={benchmark.id}
              benchmark={benchmark}
              gameName={gameName(benchmark)}
              view="list"
              expanded={selectedId === benchmark.id}
              onToggle={() => onToggleSelected(benchmark.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {benchmarks.map((benchmark) => (
        <BenchmarkCard
          key={benchmark.id}
          benchmark={benchmark}
          gameName={gameName(benchmark)}
          view="grid"
          expanded={selectedId === benchmark.id}
          onToggle={() => onToggleSelected(benchmark.id)}
        />
      ))}
    </div>
  );
}
