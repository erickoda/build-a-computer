'use client';

import * as React from 'react';

import { cn } from '@/src/utils/utils';

// ---------------------------------------------------------------------------
// Context — shares orientation & resize callback between Group and Handle
// ---------------------------------------------------------------------------

interface ResizableGroupContextValue {
  orientation: 'horizontal' | 'vertical';
  registerPanel: (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => void;
  unregisterPanel: (id: string) => void;
  startResize: (handleIndex: number, e: React.PointerEvent) => void;
}

const ResizableGroupContext =
  React.createContext<ResizableGroupContextValue | null>(null);

function useResizableGroup() {
  const ctx = React.useContext(ResizableGroupContext);
  if (!ctx)
    throw new Error(
      'Resizable components must be used inside <ResizablePanelGroup>',
    );
  return ctx;
}

// ---------------------------------------------------------------------------
// ResizablePanelGroup
// ---------------------------------------------------------------------------

export interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
}

function ResizablePanelGroup({
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

// ---------------------------------------------------------------------------
// ResizablePanel
// ---------------------------------------------------------------------------

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minsize?: number;
  id?: string;
}

function ResizablePanel({
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

// ---------------------------------------------------------------------------
// ResizableHandle
// ---------------------------------------------------------------------------

export interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
  handleIndex?: number;
}

function ResizableHandle({
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
      onKeyDown={(e) => {
        // keyboard nudge: arrow keys move by 1%
        if (
          !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
        )
          return;
      }}
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

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
