import type { ReactNode } from 'react';

// Hairline-ruled row: small mono marker on the left, content on the right.
export function Row({
  marker,
  children,
}: {
  marker: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="group grid grid-cols-[4rem_1fr] items-baseline gap-4 border-t border-foreground/15 py-6 sm:grid-cols-[5rem_1fr]">
      <span className="font-mono text-xs text-muted-foreground">{marker}</span>
      <div className="font-sans">{children}</div>
    </div>
  );
}
