'use client';

import { benchmark } from '@/src/utils/benchmarks';
import { useMemo, useState } from 'react';
import { FilterPanel, type Filters, PRICE_CEILING } from './filter-panel';
import { ProductCard } from './product-card';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
// import { LayoutGrid, Rows3 } from "lucide-react"
import { cn } from '@/src/utils/utils';
import { Bars3Icon, Squares2X2Icon } from '@heroicons/react/16/solid';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const BenchmarksPage = () => {
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    brands: [],
    maxPrice: PRICE_CEILING,
    inStockOnly: false,
  });
  const [sort, setSort] = useState<SortKey>('featured');
  const [density, setDensity] = useState<'comfortable' | 'compact'>(
    'comfortable',
  );

  const filtered = useMemo(() => {
    const result = benchmark.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category))
        return false;
      if (filters.brands.length && !filters.brands.includes(p.brand))
        return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      return true;
    });

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }
    return result;
  }, [filters, sort]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen w-full items-stretch"
    >
      <ResizablePanel defaultSize={22} minsize={16}>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={78} minsize={40}>
        <div className="flex h-full flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
            <div>
              <h1 className="text-lg font-semibold">Benchmarks</h1>
              <p className="text-sm text-muted-foreground">
                Drag the divider to resize the filters.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ToggleGroup
                type="single"
                value={density}
                onValueChange={(v) =>
                  v && setDensity(v as 'comfortable' | 'compact')
                }
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem
                  value="comfortable"
                  aria-label="Comfortable grid"
                >
                  <Squares2X2Icon className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact grid">
                  <Bars3Icon className="size-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium">
                  No products match your filters
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting or clearing your filters.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  density === 'comfortable'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5',
                )}
              >
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default BenchmarksPage;
