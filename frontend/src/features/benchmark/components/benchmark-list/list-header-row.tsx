import { LIST_GRID_COLS } from '../benchmark-card/format';

export function ListHeaderRow() {
  return (
    // Horizontal scroll wrapper matches the one on each BenchmarkCard list row,
    // so header and rows stay aligned when scrolling sideways on mobile.
    <div className="overflow-x-auto">
      <div
        className="sticky top-0 z-10 grid border-b border-t bg-muted/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-muted-foreground rounded-t-lg overflow-hidden min-w-[700px]"
        style={{ gridTemplateColumns: LIST_GRID_COLS }}
      >
        <div className="px-3 py-2">Game</div>
        <div className="px-2 py-2 text-center">Res</div>
        <div className="px-2 py-2 text-center">Quality</div>
        <div className="py-2" />
        <div className="px-2 py-2 text-center">Avg</div>
        <div className="px-2 py-2 text-center">Min</div>
        <div className="px-2 py-2 text-center">Max</div>
        <div className="px-3 py-2">GPU</div>
        <div className="px-3 py-2">CPU</div>
        <div className="px-3 py-2">RAM</div>
        <div className="px-2 py-2 text-center">Score</div>
        <div className="px-3 py-2 text-right">Price</div>
      </div>
    </div>
  );
}
