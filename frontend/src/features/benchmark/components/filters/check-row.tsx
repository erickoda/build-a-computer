import { CheckIcon } from '@heroicons/react/16/solid';

type CheckRowProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
};

export function CheckRow({
  id,
  label,
  checked,
  onCheckedChange,
}: CheckRowProps) {
  return (
    <button
      type="button"
      id={id}
      onClick={onCheckedChange}
      className={[
        'flex w-full items-center justify-between',
        'rounded-lg border px-3 py-2 text-sm font-medium',
        'transition-colors duration-150 text-left',
        checked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-foreground hover:bg-muted',
      ].join(' ')}
    >
      <span>{label}</span>
      {checked && <CheckIcon className="size-4 shrink-0 text-primary" />}
    </button>
  );
}
