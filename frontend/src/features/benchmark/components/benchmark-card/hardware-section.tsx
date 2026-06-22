type HardwareSectionProps = {
  /** Small kicker label, e.g. "GPU" / "CPU" / "RAM" */
  kicker: string;
  /** The joined product name, e.g. "NVIDIA GeForce RTX 4090" */
  title: string;
  /**
   * 1-2 standout specs rendered larger, side by side above the dense grid
   * — e.g. VRAM for a GPU, Cores/Threads for a CPU, Capacity for RAM.
   */
  heroSpecs?: React.ReactNode;
  /** The remaining specs, rendered in a dense 2-column grid. */
  children: React.ReactNode;
};

export function HardwareSection({
  kicker,
  title,
  heroSpecs,
  children,
}: HardwareSectionProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border bg-card/40 p-3">
      {/* Kicker + joined product name — this is the part that lets you
          recognize the part at a glance instead of re-assembling it from
          separate Brand/Family/Series rows. */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {kicker}
        </span>
        <h4 className="text-sm font-semibold leading-snug">{title}</h4>
      </div>

      {/* Hero specs — the 1-2 numbers that actually matter for comparing
          this part against another, given more visual weight. */}
      {heroSpecs && <div className="flex gap-4 border-t pt-2">{heroSpecs}</div>}

      {/* Remaining specs — still all present, just denser: 2 columns
          instead of 1 cuts the vertical footprint roughly in half. */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 border-t pt-2">
        {children}
      </div>
    </div>
  );
}
