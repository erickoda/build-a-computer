import AuthButton from '@/src/components/auth-button';
import { Bars3Icon, Squares2X2Icon } from '@heroicons/react/16/solid';
import {
  ListBox,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';

export type SortKey =
  | 'avg-fps-desc'
  | 'min-fps-desc'
  | 'max-fps-desc'
  | 'price-asc'
  | 'price-desc';

export type Density = 'comfortable' | 'compact';

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'avg-fps-desc', label: 'Avg FPS: High to Low' },
  { value: 'min-fps-desc', label: 'Min FPS: High to Low' },
  { value: 'max-fps-desc', label: 'Max FPS: High to Low' },
  { value: 'price-asc', label: 'System Price: Low to High' },
  { value: 'price-desc', label: 'System Price: High to Low' },
];

type ListToolbarProps = {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  density: Density;
  onDensityChange: (density: Density) => void;
};

export function ListToolbar({
  sort,
  onSortChange,
  density,
  onDensityChange,
}: ListToolbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">Benchmarks</h1>
        <p className="text-sm text-muted-foreground">
          Drag the divider to resize the filters.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Select
          aria-label="Sort by"
          variant="secondary"
          value={sort}
          onChange={(value) => onSortChange(value as SortKey)}
        >
          <Select.Trigger className="h-9 rounded-md text-sm">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="Sort by">
              {sortOptions.map((o) => (
                <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
                  {o.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[density]}
          onSelectionChange={(keys) => {
            const next = Array.from(keys)[0] as Density | undefined;
            if (next) onDensityChange(next);
          }}
          size="sm"
        >
          <ToggleButton id="comfortable" aria-label="Comfortable grid">
            <Squares2X2Icon className="size-4" />
          </ToggleButton>
          <ToggleButton id="compact" aria-label="Compact grid">
            <Bars3Icon className="size-4" />
          </ToggleButton>
        </ToggleButtonGroup>

        <AuthButton className="flex z-20" />
      </div>
    </header>
  );
}
