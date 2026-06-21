'use client';

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { useId, useState } from 'react';

type GlassComboboxProps = {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  id?: string;
};

export function GlassCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  id,
}: GlassComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const innerId = useId();
  const buttonId = id ?? innerId;

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  function handleToggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpen(false);
      setQuery('');
    }
  }

  const triggerLabel =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? placeholder)
        : `${value.length} games selected`;

  return (
    <div className="relative" onBlur={handleBlur} tabIndex={-1}>
      <button
        type="button"
        id={buttonId}
        onClick={() => setOpen((p) => !p)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-black/20 bg-white/30 px-4 text-sm font-medium text-black backdrop-blur-md transition-colors hover:border-black/40 hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white dark:hover:border-white/40 dark:hover:bg-black/40 dark:focus-visible:ring-white/40"
      >
        <span
          className={
            value.length > 0
              ? 'text-black dark:text-white'
              : 'text-black/50 dark:text-white/50'
          }
        >
          {triggerLabel}
        </span>
        <ChevronUpDownIcon
          className={`size-4 shrink-0 text-black/50 dark:text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-black/20 bg-white/80 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 dark:border-white/20 dark:bg-black/60">
          <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-black placeholder:text-black/40 outline-none dark:text-white dark:placeholder:text-white/40"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 dark:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-black/40 dark:text-white/40">
                No results.
              </li>
            ) : (
              filtered.map((o) => {
                const isSelected = value.includes(o.value);
                return (
                  <li
                    key={o.value}
                    onClick={() => handleToggle(o.value)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-black dark:text-white transition-colors hover:bg-black/8 dark:hover:bg-white/10 ${isSelected ? 'bg-black/5 dark:bg-white/5' : ''}`}
                  >
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-all duration-150 ${isSelected ? 'border-black bg-black dark:border-white dark:bg-white' : 'border-black/30 dark:border-white/30'}`}
                    >
                      {isSelected && (
                        <CheckIcon className="size-3 text-white dark:text-black" />
                      )}
                    </span>
                    {o.label}
                  </li>
                );
              })
            )}
          </ul>
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t border-black/10 px-4 py-2.5 animate-in fade-in duration-150 dark:border-white/10">
              <span className="text-xs text-black/50 dark:text-white/50">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
                className="rounded-lg bg-black px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
