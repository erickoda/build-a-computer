type PillGroupProps = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  formatLabel?: (v: string) => string;
};

export function PillGroup({
  options,
  value,
  onChange,
  formatLabel,
}: PillGroupProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`h-9 rounded-lg border px-4 text-sm font-medium transition-all duration-200 ${value === opt
              ? 'border-black bg-black text-white scale-105 dark:border-white dark:bg-white dark:text-black'
              : 'border-black/20 bg-white/30 text-black/70 backdrop-blur-md hover:border-black/40 hover:text-black dark:border-white/20 dark:bg-black/30 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white'
            }`}
        >
          {formatLabel ? formatLabel(opt) : opt}
        </button>
      ))}
    </div>
  );
}
