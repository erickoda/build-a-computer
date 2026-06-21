import { ComboBox, Input, ListBox } from '@heroui/react';

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
};

type HardwareComboboxProps = {
  id?: string;
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
};

export function HardwareCombobox({
  id,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select…',
  emptyMessage = 'No results found.',
}: HardwareComboboxProps) {
  return (
    <ComboBox
      selectedKey={value ?? null}
      onSelectionChange={(key) => onChange((key as string | null) ?? '')}
      isDisabled={disabled}
    >
      <ComboBox.InputGroup>
        <Input id={id} placeholder={placeholder} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox
          aria-label={placeholder}
          renderEmptyState={() => (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
        >
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium leading-snug">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </span>
                )}
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
