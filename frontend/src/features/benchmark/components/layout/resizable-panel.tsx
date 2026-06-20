import * as React from 'react';

import { cn } from '@/src/utils/utils';
import { useResizableGroup } from './resizable-context';

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minsize?: number;
  id?: string;
}

export function ResizablePanel({
  className,
  defaultSize,
  style,
  id: idProp,
  ...props
}: ResizablePanelProps) {
  const id = React.useId();
  const panelId = idProp ?? id;
  const ref = React.useRef<HTMLDivElement>(null);
  const { registerPanel, unregisterPanel } = useResizableGroup();

  React.useEffect(() => {
    registerPanel(panelId, ref);
    return () => unregisterPanel(panelId);
  }, [panelId, registerPanel, unregisterPanel]);

  return (
    <div
      data-slot="resizable-panel"
      ref={ref}
      style={{
        flex: defaultSize !== undefined ? `0 0 ${defaultSize}%` : '1 1 0%',
        overflow: 'hidden',
        ...style,
      }}
      className={cn('min-w-0 min-h-0', className)}
      {...props}
    />
  );
}
