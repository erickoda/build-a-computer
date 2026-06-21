import { Disclosure } from '@heroui/react';
import { CountBadge } from './count-badge';

type FilterSectionProps = {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function FilterSection({
  title,
  count,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  return (
    <Disclosure defaultExpanded={defaultOpen} className="rounded-lg border">
      <Disclosure.Trigger className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
          <CountBadge count={count} />
        </span>
        <Disclosure.Indicator className="size-4 shrink-0 text-muted-foreground" />
      </Disclosure.Trigger>
      <Disclosure.Content>
        <div className="border-t px-3 py-3">{children}</div>
      </Disclosure.Content>
    </Disclosure>
  );
}
