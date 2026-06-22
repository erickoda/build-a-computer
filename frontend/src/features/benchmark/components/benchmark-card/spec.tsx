type SpecProps = {
  label: string;
  value: React.ReactNode;
  /**
   * 'hero' renders larger and bolder — reserve for the 1-2 specs that
   * actually differentiate this piece of hardware (e.g. VRAM on a GPU,
   * cores/threads on a CPU), so they read at a glance without the rest of
   * the specs needing to disappear to make room for that emphasis.
   */
  variant?: 'default' | 'hero';
};

export function Spec({ label, value, variant = 'default' }: SpecProps) {
  if (variant === 'hero') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums leading-tight">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="shrink-0 text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-right text-[11px] font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}
