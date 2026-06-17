"use client"

import * as React from "react"

import { cn } from "@/src/utils/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({ className, onCheckedChange, onChange, checked, defaultChecked, ...props }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    onCheckedChange?.(e.target.checked)
  }

  return (
    <span
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        "aria-invalid:border-destructive",
        "dark:bg-input/30",
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      {/* Checkmark indicator — visible when checked */}
      <span
        data-slot="checkbox-indicator"
        className={cn(
          "pointer-events-none grid place-content-center text-current transition-none",
          "[input:not(:checked)~&]:hidden"
        )}
      >
        {/* Inline check icon (replaces lucide-react CheckIcon) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </span>
  )
}

export { Checkbox }
