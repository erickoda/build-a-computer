export function CountBadge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
      {count}
    </span>
  );
}
