'use client';

import * as React from 'react';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CollapsibleContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null,
);

function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx)
    throw new Error(
      'Collapsible compound components must be used inside <Collapsible>',
    );
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled,
  children,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen: React.Dispatch<React.SetStateAction<boolean>> =
    React.useCallback(
      (value) => {
        const next = typeof value === 'function' ? value(open) : value;
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [open, isControlled, onOpenChange],
    );

  return (
    <CollapsibleContext.Provider value={{ open, setOpen, disabled }}>
      <div
        data-slot="collapsible"
        data-state={open ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function CollapsibleTrigger({
  onClick,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const { open, setOpen, disabled } = useCollapsible();

  return (
    <button
      data-slot="collapsible-trigger"
      type="button"
      aria-expanded={open}
      disabled={disabled}
      onClick={(e) => {
        setOpen((prev) => !prev);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Panel (Content)
// ---------------------------------------------------------------------------

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CollapsibleContent({
  children,
  style,
  ...props
}: CollapsibleContentProps) {
  const { open } = useCollapsible();

  return (
    <div
      data-slot="collapsible-content"
      data-state={open ? 'open' : 'closed'}
      hidden={!open}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
