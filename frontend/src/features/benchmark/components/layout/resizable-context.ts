import * as React from 'react';

// HeroUI has no resizable-panel primitive, so this stays a small hand-rolled
// utility rather than a heroui-equivalent duplicate.

export interface ResizableGroupContextValue {
  orientation: 'horizontal' | 'vertical';
  registerPanel: (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => void;
  unregisterPanel: (id: string) => void;
  startResize: (handleIndex: number, e: React.PointerEvent) => void;
}

export const ResizableGroupContext =
  React.createContext<ResizableGroupContextValue | null>(null);

export function useResizableGroup() {
  const ctx = React.useContext(ResizableGroupContext);
  if (!ctx)
    throw new Error(
      'Resizable components must be used inside <ResizablePanelGroup>',
    );
  return ctx;
}
