'use client';

import { useEffect } from 'react';
import { RESOLUTION_LABELS } from '../constants';
import { Game } from '../types/game';

type ConfirmationProps = {
  games: Game[];
  resolution: number | null;
  quality: string;
  budget: [number, number];
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationOverlay({
  games: selectedGames,
  resolution,
  quality,
  budget,
  onConfirm,
  onCancel,
}: ConfirmationProps) {
  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const gamesLabel =
    selectedGames.length === 0
      ? '—'
      : selectedGames.length === 1
        ? selectedGames[0].name
        : selectedGames.map((g) => g.name).join(', ');

  const rows = [
    { label: 'Game', value: gamesLabel },
    {
      label: 'Resolution',
      value: resolution
        ? (RESOLUTION_LABELS[resolution] ?? String(resolution))
        : '—',
    },
    { label: 'Quality', value: quality || '—' },
    {
      label: 'Budget',
      value: `$${budget[0].toLocaleString()} – $${budget[1].toLocaleString()}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/85 p-5 sm:p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 fade-in duration-200 dark:border-white/20 dark:bg-black/70"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-lg font-bold text-black dark:text-white">
          Confirm your build
        </h2>
        <div className="mb-8 flex flex-col gap-3">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4"
            >
              <span className="text-sm text-black/50 dark:text-white/50">
                {label}
              </span>
              <span className="text-right text-sm font-medium text-black dark:text-white">
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 flex-1 rounded-xl border border-black/20 bg-black/8 text-sm font-medium text-black transition-colors hover:bg-black/15 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 flex-1 rounded-xl bg-black text-sm font-bold text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Build it
          </button>
        </div>
      </div>
    </div>
  );
}
