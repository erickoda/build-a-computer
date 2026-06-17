"use client"

import * as React from "react"

import { cn } from "@/src/utils/utils"

// ---------------------------------------------------------------------------
// Variant maps (replaces cva)
// ---------------------------------------------------------------------------

type ToggleVariant = "default" | "outline"
type ToggleSize = "default" | "sm" | "lg"

const toggleVariantClasses: Record<ToggleVariant, string> = {
  default: "bg-transparent",
  outline: "border border-input bg-transparent hover:bg-muted",
}

const toggleSizeClasses: Record<ToggleSize, string> = {
  default:
    "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
  lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
}

const toggleBase =
  "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ToggleVariant
  size?: ToggleSize
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

function Toggle({
  className,
  variant = "default",
  size = "default",
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  ...props
}: ToggleProps) {
  const [uncontrolledPressed, setUncontrolledPressed] = React.useState(defaultPressed)
  const isControlled = controlledPressed !== undefined
  const pressed = isControlled ? controlledPressed : uncontrolledPressed

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !pressed
    if (!isControlled) setUncontrolledPressed(next)
    onPressedChange?.(next)
    onClick?.(e)
  }

  return (
    <button
      type="button"
      data-slot="toggle"
      data-state={pressed ? "on" : "off"}
      aria-pressed={pressed}
      onClick={handleClick}
      className={cn(
        toggleBase,
        toggleVariantClasses[variant],
        toggleSizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export { Toggle, toggleVariantClasses, toggleSizeClasses, toggleBase }
export type { ToggleVariant, ToggleSize }
