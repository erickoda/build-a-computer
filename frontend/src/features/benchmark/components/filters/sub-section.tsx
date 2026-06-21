import { Disclosure } from '@heroui/react';
import { CountBadge } from './count-badge';

type SubSectionProps = {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

// A nested, collapsible sub-group (e.g. GPU inside Hardware)
export function SubSection({
  title,
  count,
  children,
  defaultOpen = false,
}: SubSectionProps) {
  return (
    <Disclosure defaultExpanded={defaultOpen}>
      <Disclosure.Trigger className="flex w-full items-center justify-between gap-1 py-1.5 text-left">
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          {title}
          <CountBadge count={count} />
        </span>
        <Disclosure.Indicator className="size-3.5 shrink-0 text-muted-foreground" />
      </Disclosure.Trigger>
      <Disclosure.Content>
        <div className="ml-2 flex flex-col gap-2.5 border-l pl-3 pt-1.5 pb-0.5">
          {children}
        </div>
      </Disclosure.Content>
    </Disclosure>
  );
}
