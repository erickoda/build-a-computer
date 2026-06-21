type SpecRowProps = { label: string; value: string; price: number };

export function SpecRow({ label, value, price }: SpecRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-white">{value}</p>
      </div>
      <span className="shrink-0 text-sm tabular-nums text-white/60">
        ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}
