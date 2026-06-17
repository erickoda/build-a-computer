"use client"

import { useState } from "react"
// import { ChevronDown } from "lucide-react"
import { brands, categories } from "@/src/utils/benchmarks"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { ChevronDownIcon } from "@heroicons/react/16/solid"

export type Filters = {
  categories: string[]
  brands: string[]
  maxPrice: number
  inStockOnly: boolean
}

export const PRICE_CEILING = 1000

type FilterPanelProps = {
  filters: Filters
  onChange: (filters: Filters) => void
  resultCount: number
}

type FilterSectionProps = {
  title: string
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, count, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
          {count ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {count}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t px-3 py-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  function toggleArrayValue(key: "categories" | "brands", value: string) {
    const current = filters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: next })
  }

  function reset() {
    onChange({
      categories: [],
      brands: [],
      maxPrice: PRICE_CEILING,
      inStockOnly: false,
    })
  }

  const priceActive = filters.maxPrice < PRICE_CEILING
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.inStockOnly ||
    priceActive

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div>
          <h2 className="text-sm font-semibold">Filters</h2>
          <p className="text-xs text-muted-foreground">{resultCount} results</p>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
            Clear
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-4">
          <FilterSection title="Category" count={filters.categories.length}>
            <div className="flex flex-col gap-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleArrayValue("categories", category)}
                  />
                  <Label htmlFor={`cat-${category}`} className="text-sm font-normal">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Brand" count={filters.brands.length}>
            <div className="flex flex-col gap-3">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleArrayValue("brands", brand)}
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-sm font-normal">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Max price" count={priceActive ? 1 : 0}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Up to</span>
                <span className="text-sm font-medium tabular-nums">
                  ${filters.maxPrice}
                </span>
              </div>
              <Slider
                min={0}
                max={PRICE_CEILING}
                step={10}
                value={[filters.maxPrice]}
                onValueChange={([value]) => onChange({ ...filters, maxPrice: value })}
              />
            </div>
          </FilterSection>

          <FilterSection title="Availability" count={filters.inStockOnly ? 1 : 0}>
            <div className="flex items-center gap-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStockOnly}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, inStockOnly: checked === true })
                }
              />
              <Label htmlFor="in-stock" className="text-sm font-normal">
                In stock only
              </Label>
            </div>
          </FilterSection>
        </div>
      </ScrollArea>
    </div>
  )
}
