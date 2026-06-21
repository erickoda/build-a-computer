import * as React from 'react';

import { cn } from '@/src/utils/utils';
import { ResizableGroupContext } from './resizable-context';

export interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
}

export function ResizablePanelGroup({
  className,
  direction = 'horizontal',
  children,
  ...props
}: ResizablePanelGroupProps) {
  const orientation = direction;
  const groupRef = React.useRef<HTMLDivElement>(null);
  const panelRefs = React.useRef<
    Map<string, React.RefObject<HTMLDivElement | null>>
  >(new Map());

  const registerPanel = React.useCallback(
    (id: string, ref: React.RefObject<HTMLDivElement | null>) => {
      panelRefs.current.set(id, ref);
    },
    [],
  );

  const unregisterPanel = React.useCallback((id: string) => {
    panelRefs.current.delete(id);
  }, []);

  const startResize = React.useCallback(
    (handleIndex: number, e: React.PointerEvent) => {
      e.preventDefault();
      const group = groupRef.current;
      if (!group) return;

      const panels = Array.from(panelRefs.current.values()).map(
        (r) => r.current,
      );
      const before = panels[handleIndex];
      const after = panels[handleIndex + 1];
      if (!before || !after) return;

      const isH = orientation === 'horizontal';
      const startPos = isH ? e.clientX : e.clientY;
      const startBeforeSize = isH ? before.offsetWidth : before.offsetHeight;
      const startAfterSize = isH ? after.offsetWidth : after.offsetHeight;
      const total = startBeforeSize + startAfterSize;

      const onMove = (ev: PointerEvent) => {
        const delta = (isH ? ev.clientX : ev.clientY) - startPos;
        const newBefore = Math.max(
          40,
          Math.min(total - 40, startBeforeSize + delta),
        );
        const newAfter = total - newBefore;
        before.style.flex = 'none';
        before.style[isH ? 'width' : 'height'] = `${newBefore}px`;
        after.style.flex = 'none';
        after.style[isH ? 'width' : 'height'] = `${newAfter}px`;
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [orientation],
  );

  return (
    <ResizableGroupContext.Provider
      value={{ orientation, registerPanel, unregisterPanel, startResize }}
    >
      <div
        data-slot="resizable-panel-group"
        aria-orientation={orientation}
        ref={groupRef}
        className={cn(
          'flex h-full w-full',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ResizableGroupContext.Provider>
  );
}
