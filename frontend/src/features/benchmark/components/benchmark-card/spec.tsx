export function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="shrink-0 text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-[11px] font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}
