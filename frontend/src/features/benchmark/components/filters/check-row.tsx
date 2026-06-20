import { Checkbox } from '@heroui/react';

type CheckRowProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
};

export function CheckRow({ id, label, checked, onCheckedChange }: CheckRowProps) {
  return (
    <Checkbox
      id={id}
      isSelected={checked}
      onChange={onCheckedChange}
      className="flex items-center gap-2"
    >
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content className="text-sm font-normal">{label}</Checkbox.Content>
    </Checkbox>
  );
}
