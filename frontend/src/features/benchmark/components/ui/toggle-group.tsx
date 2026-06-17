"use client"

import * as React from "react"

import { cn } from "@/src/utils/utils"
import { toggleBase, toggleVariantClasses, toggleSizeClasses } from "./toggle"
import type { ToggleVariant, ToggleSize } from "./toggle"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ToggleGroupContextValue {
  variant?: ToggleVariant
  size?: ToggleSize
  spacing?: number
  orientation?: "horizontal" | "vertical"
  value: string[]
  onItemPress: (itemValue: string) => void
  type: "single" | "multiple"
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
  value: [],
  onItemPress: () => {},
  type: "single",
})

// ---------------------------------------------------------------------------
// ToggleGroup
// ---------------------------------------------------------------------------

export interface ToggleGroupSingleProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: ToggleVariant
  size?: ToggleSize
  spacing?: number
  orientation?: "horizontal" | "vertical"
}

export interface ToggleGroupMultipleProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "multiple"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  variant?: ToggleVariant
  size?: ToggleSize
  spacing?: number
  orientation?: "horizontal" | "vertical"
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupProps) {
  const type = (props as ToggleGroupMultipleProps).type ?? "single"

  // Controlled vs uncontrolled value
  const rawValue = (props as ToggleGroupSingleProps).value
  const rawDefault = (props as ToggleGroupSingleProps).defaultValue
  const onValueChange = (props as ToggleGroupSingleProps).onValueChange

  const toArray = (v: string | string[] | undefined): string[] =>
    v === undefined ? [] : Array.isArray(v) ? v : [v]

  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(
    toArray(rawDefault)
  )
  const isControlled = rawValue !== undefined
  const value = isControlled ? toArray(rawValue) : uncontrolledValue

  const onItemPress = React.useCallback(
    (itemValue: string) => {
      let next: string[]
      if (type === "multiple") {
        next = value.includes(itemValue)
          ? value.filter((v) => v !== itemValue)
          : [...value, itemValue]
      } else {
        next = value.includes(itemValue) ? [] : [itemValue]
      }
      if (!isControlled) setUncontrolledValue(next)
      if (type === "multiple") {
        ;(onValueChange as ((v: string[]) => void) | undefined)?.(next)
      } else {
        ;(onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? "")
      }
    },
    [value, type, isControlled, onValueChange]
  )

  return (
    <ToggleGroupContext.Provider
      value={{ variant, size, spacing, orientation, value, onItemPress, type }}
    >
      <div
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        data-orientation={orientation}
        role="group"
        className={cn(
          "group/toggle-group flex w-fit flex-row items-center rounded-lg",
          spacing > 0 ? `gap-${spacing}` : "gap-0",
          orientation === "vertical" && "flex-col items-stretch",
          "data-[size=sm]:rounded-[min(var(--radius-md),10px)]",
          className
        )}
        style={{ "--gap": spacing } as React.CSSProperties}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// ToggleGroupItem
// ---------------------------------------------------------------------------

export interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  variant?: ToggleVariant
  size?: ToggleSize
}

function ToggleGroupItem({
  className,
  children,
  value: itemValue,
  variant: variantProp = "default",
  size: sizeProp = "default",
  onClick,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  const variant = context.variant ?? variantProp
  const size = context.size ?? sizeProp
  const spacing = context.spacing ?? 2
  const orientation = context.orientation ?? "horizontal"
  const pressed = context.value.includes(itemValue)

  return (
    <button
      type="button"
      data-slot="toggle-group-item"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-state={pressed ? "on" : "off"}
      aria-pressed={pressed}
      onClick={(e) => {
        context.onItemPress(itemValue)
        onClick?.(e)
      }}
      className={cn(
        "shrink-0 focus:z-10 focus-visible:z-10",
        toggleBase,
        toggleVariantClasses[variant],
        toggleSizeClasses[size],
        // Spacing-0 border merging (mirrors the original)
        spacing === 0 && [
          "rounded-none px-2",
          "has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
          orientation === "horizontal" && [
            "first:rounded-l-lg last:rounded-r-lg",
            variant === "outline" && "border-l-0 first:border-l",
          ],
          orientation === "vertical" && [
            "first:rounded-t-lg last:rounded-b-lg",
            variant === "outline" && "border-t-0 first:border-t",
          ],
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
