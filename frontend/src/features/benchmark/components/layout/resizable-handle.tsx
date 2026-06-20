import * as React from 'react';

import { cn } from '@/src/utils/utils';
import { useResizableGroup } from './resizable-context';

export interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
  handleIndex?: number;
}

export function ResizableHandle({
  withHandle,
  className,
  handleIndex = 0,
  ...props
}: ResizableHandleProps) {
  const { orientation, startResize } = useResizableGroup();
  const isH = orientation === 'horizontal';

  return (
    <div
      data-slot="resizable-handle"
      role="separator"
      aria-orientation={orientation}
      tabIndex={0}
      onPointerDown={(e) => startResize(handleIndex, e)}
      className={cn(
        'relative flex items-center justify-center bg-border',
        'ring-offset-background focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring',
        isH
          ? 'w-px cursor-col-resize after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2'
          : 'h-px w-full cursor-row-resize after:absolute after:left-0 after:h-1 after:w-full after:-translate-y-1/2',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            'z-10 flex shrink-0 rounded-lg bg-border',
            isH ? 'h-6 w-1' : 'h-1 w-6 rotate-90',
          )}
        />
      )}
    </div>
  );
}
