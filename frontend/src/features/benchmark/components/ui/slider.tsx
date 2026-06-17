import * as React from "react"

import { cn } from "@/src/utils/utils"

// ---------------------------------------------------------------------------
// Single-thumb Slider — wraps <input type="range">
// ---------------------------------------------------------------------------

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange"> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  orientation?: "horizontal" | "vertical"
  onValueChange?: (value: number) => void
  disabled?: boolean
}

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  onValueChange,
  disabled,
  ...props
}: SliderProps) {
  const isVertical = orientation === "vertical"

  return (
    <div
      data-slot="slider"
      data-orientation={orientation}
      data-disabled={disabled ? true : undefined}
      className={cn(
        "relative flex touch-none select-none items-center",
        isVertical
          ? "h-full min-h-40 w-auto flex-col data-vertical:h-full"
          : "w-full data-horizontal:w-full",
        "data-[disabled]:opacity-50",
        className
      )}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        style={isVertical ? { writingMode: "vertical-lr", direction: "rtl" } : undefined}
        className={cn(
          // Reset & track
          "appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 outline-none",
          isVertical ? "h-full w-1" : "h-1 w-full",
          // Track (WebKit)
          "[&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted",
          isVertical
            ? "[&::-webkit-slider-runnable-track]:w-1 [&::-webkit-slider-runnable-track]:h-full"
            : "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:w-full",
          // Track (Firefox)
          "[&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted",
          isVertical
            ? "[&::-moz-range-track]:w-1"
            : "[&::-moz-range-track]:h-1",
          // Progress fill (WebKit)
          "[&::-webkit-slider-thumb]:appearance-none",
          // Thumb (WebKit)
          "[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring",
          "[&::-webkit-slider-thumb]:bg-white",
          "[&::-webkit-slider-thumb]:ring-ring/50 [&::-webkit-slider-thumb]:transition-[color,box-shadow]",
          "[&::-webkit-slider-thumb]:hover:ring-[3px]",
          "[&::-webkit-slider-thumb]:focus-visible:ring-[3px]",
          "[&::-webkit-slider-thumb]:active:ring-[3px]",
          // Thumb (Firefox)
          "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ring",
          "[&::-moz-range-thumb]:bg-white",
          "[&::-moz-range-thumb]:ring-ring/50 [&::-moz-range-thumb]:transition-[color,box-shadow]",
          "[&::-moz-range-thumb]:hover:ring-[3px]"
        )}
        {...props}
      />
    </div>
  )
}

export { Slider }
