"use client"

import * as React from "react"

import { cn } from "@/src/utils/utils"

// ---------------------------------------------------------------------------
// ScrollArea
// ---------------------------------------------------------------------------

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

function ScrollArea({ className, children, orientation = "vertical", ...props }: ScrollAreaProps) {
  const overflowClass =
    orientation === "both"
      ? "overflow-auto"
      : orientation === "horizontal"
        ? "overflow-x-auto overflow-y-hidden"
        : "overflow-y-auto overflow-x-hidden"

  return (
    <div
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <div
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full rounded-[inherit] transition-[color,box-shadow] outline-none",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          overflowClass,
          // Custom scrollbar styling via Tailwind's scrollbar utilities
          // Falls back gracefully when utilities aren't available
          "[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb:hover]:bg-border/80"
        )}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ScrollBar — kept as an export for API compatibility but rendered via CSS above
// ---------------------------------------------------------------------------

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
}

function ScrollBar({ className, orientation = "vertical", ...props }: ScrollBarProps) {
  return (
    <div
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "horizontal"
          ? "h-2.5 flex-col border-t border-t-transparent"
          : "h-full w-2.5 border-l border-l-transparent",
        className
      )}
      {...props}
    >
      <div
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </div>
  )
}

export { ScrollArea, ScrollBar }
