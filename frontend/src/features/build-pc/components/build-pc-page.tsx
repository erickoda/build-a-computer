'use client';

import {
  type Game,
  games,
  graphicsQualities,
  resolutions,
} from '@/src/utils/benchmarks';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/16/solid';
import { useId, useState } from 'react';

// ─── Banner hook ──────────────────────────────────────────────────────────────
//
// Resolves a game's banner stem to a full image path.
//
// Convention: /src/app/banners/<banner>-<size>.png
//   where <size> is "desktop" | "tablet" | "mobile"
//
// Usage:
//   const src = useGameBanner('elden-ring', 'desktop');
//   // → "/src/app/banners/elden-ring-desktop.png"
//
// Update the template string below if your file naming differs.

type BannerSize = 'desktop' | 'tablet' | 'mobile';

function useGameBanner(
  banner: string | undefined,
  size: BannerSize = 'desktop',
): string | null {
  if (!banner) return null;
  return `/${banner}-${size}.png`;
}

// ─── Derived data ─────────────────────────────────────────────────────────────

const GAME_LIST = Object.values(games);

const RESOLUTION_LABELS: Record<number, string> = {
  1080: '1080p',
  1440: '1440p',
  2160: '4K',
};

// ─── Budget constants ─────────────────────────────────────────────────────────

const BUDGET_MIN = 500;
const BUDGET_MAX = 5000;
const BUDGET_STEP = 50;

// ─── Glass multi-select combobox ──────────────────────────────────────────────

type GlassComboboxProps = {
  options: { value: string; label: string }[];
  /** Selected values — always an array for multi-select. */
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  id?: string;
};

function GlassCombobox({
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

  /** Toggle a single option in/out of the selection. Keep dropdown open. */
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
        className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-white/20 bg-black/30 px-4 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <span className={value.length > 0 ? 'text-white' : 'text-white/50'}>
          {triggerLabel}
        </span>
        <ChevronUpDownIcon className="size-4 shrink-0 text-white/50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/20 bg-black/60 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-3 py-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-white/40">No results.</li>
            ) : (
              filtered.map((o) => {
                const isSelected = value.includes(o.value);
                return (
                  <li
                    key={o.value}
                    onClick={() => handleToggle(o.value)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10 ${isSelected ? 'bg-white/5' : ''}`}
                  >
                    {/* Checkbox indicator */}
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-white bg-white' : 'border-white/30'}`}
                    >
                      {isSelected && (
                        <CheckIcon className="size-3 text-black" />
                      )}
                    </span>
                    {o.label}
                  </li>
                );
              })
            )}
          </ul>
          {/* Footer: shows count + done button when something is selected */}
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
              <span className="text-xs text-white/50">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
                className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-black transition-colors hover:bg-white/90"
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

// ─── Pill toggle group ────────────────────────────────────────────────────────

type PillGroupProps = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  formatLabel?: (v: string) => string;
};

function PillGroup({ options, value, onChange, formatLabel }: PillGroupProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`h-9 rounded-lg border px-4 text-sm font-medium transition-all ${
            value === opt
              ? 'border-white bg-white text-black'
              : 'border-white/20 bg-black/30 text-white/70 backdrop-blur-md hover:border-white/40 hover:text-white'
          }`}
        >
          {formatLabel ? formatLabel(opt) : opt}
        </button>
      ))}
    </div>
  );
}

// ─── Dual-thumb budget range slider ──────────────────────────────────────────
//
// Both <input type="range"> are stacked absolutely. Without pointer-events
// isolation, the top input intercepts all clicks across the full track width,
// making the lower thumb unreachable on the left side.
//
// Fix: pointer-events:none on both inputs; pointer-events:auto on thumbs only
// (via the ::-webkit-slider-thumb / ::-moz-range-thumb pseudo-elements).
// Each thumb then only captures events when the cursor is directly over it.

type BudgetSliderProps = {
  value: [number, number];
  onChange: (v: [number, number]) => void;
};

function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  const pctLow = ((value[0] - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
  const pctHigh = ((value[1] - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  function handleLow(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), value[1] - BUDGET_STEP);
    onChange([v, value[1]]);
  }

  function handleHigh(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), value[0] + BUDGET_STEP);
    onChange([value[0], v]);
  }

  // Shared Tailwind classes for both range inputs.
  // Key rule: pointer-events-none on the input, pointer-events-auto on thumb.
  const rangeClass = [
    'absolute w-full appearance-none bg-transparent',
    'pointer-events-none', // ← input ignores mouse
    // WebKit thumb
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:pointer-events-auto', // ← thumb captures mouse
    '[&::-webkit-slider-thumb]:size-4',
    '[&::-webkit-slider-thumb]:rounded-full',
    '[&::-webkit-slider-thumb]:bg-white',
    '[&::-webkit-slider-thumb]:border-2',
    '[&::-webkit-slider-thumb]:border-black/20',
    '[&::-webkit-slider-thumb]:shadow-md',
    '[&::-webkit-slider-thumb]:cursor-grab',
    '[&::-webkit-slider-thumb]:active:cursor-grabbing',
    '[&::-webkit-slider-runnable-track]:bg-transparent',
    // Firefox thumb
    '[&::-moz-range-thumb]:pointer-events-auto', // ← thumb captures mouse
    '[&::-moz-range-thumb]:size-4',
    '[&::-moz-range-thumb]:rounded-full',
    '[&::-moz-range-thumb]:bg-white',
    '[&::-moz-range-thumb]:border-2',
    '[&::-moz-range-thumb]:border-black/20',
    '[&::-moz-range-thumb]:cursor-grab',
    '[&::-moz-range-track]:bg-transparent',
  ].join(' ');

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Track + thumbs */}
      <div className="relative flex h-5 items-center">
        {/* Base track */}
        <div className="absolute h-1 w-full rounded-full bg-white/20" />
        {/* Active fill between the two thumbs */}
        <div
          className="absolute h-1 rounded-full bg-white"
          style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }}
        />
        {/* Low thumb — z-index raised when near the ceiling to stay hittable */}
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={value[0]}
          onChange={handleLow}
          style={{ zIndex: value[0] >= value[1] - BUDGET_STEP ? 5 : 3 }}
          className={rangeClass}
        />
        {/* High thumb */}
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={value[1]}
          onChange={handleHigh}
          style={{ zIndex: 4 }}
          className={rangeClass}
        />
      </div>
      {/* Floor / ceiling labels */}
      <div className="flex justify-between text-xs text-white/40">
        <span>${BUDGET_MIN.toLocaleString()}</span>
        <span>${BUDGET_MAX.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─── Confirmation overlay ─────────────────────────────────────────────────────

type ConfirmationProps = {
  games: Game[];
  resolution: number | null;
  quality: string;
  budget: [number, number];
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmationOverlay({
  games: selectedGames,
  resolution,
  quality,
  budget,
  onConfirm,
  onCancel,
}: ConfirmationProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-black/70 p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 fade-in duration-200">
        <h2 className="mb-6 text-lg font-bold text-white">
          Confirm your build
        </h2>

        <div className="mb-8 flex flex-col gap-3">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4"
            >
              <span className="text-sm text-white/50">{label}</span>
              <span className="text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 flex-1 rounded-xl border border-white/20 bg-white/10 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 flex-1 rounded-xl bg-white text-sm font-bold text-black transition-colors hover:bg-white/90"
          >
            Build it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Success overlay ──────────────────────────────────────────────────────────

function SuccessOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-5 text-center animate-in zoom-in-95 fade-in duration-300">
        <div className="flex size-20 items-center justify-center rounded-full border border-white/20 bg-white/10">
          <CheckCircleIcon className="size-10 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">Request sent</p>
          <p className="mt-1 text-sm text-white/60">
            We'll find the best builds for your configuration.
          </p>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="mt-2 h-10 rounded-xl bg-white px-8 text-sm font-bold text-black transition-colors hover:bg-white/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Field label ──────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export type BuildPcSubmitData = {
  /** One or more selected games. */
  games: Game[];
  resolution: number;
  quality: string;
  budgetMin: number;
  budgetMax: number;
};

type BuildPcPageProps = {
  onBack: () => void;
  onSubmit?: (data: BuildPcSubmitData) => void;
};

export function BuildPcPage({ onBack, onSubmit }: BuildPcPageProps) {
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [resolution, setResolution] = useState<number | null>(null);
  const [quality, setQuality] = useState<string>('');
  const [budget, setBudget] = useState<[number, number]>([1000, 3000]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedGames = selectedGameIds.map((id) => games[id]).filter(Boolean);

  // Show the banner of the first selected game (or none)
  const bannerSrc = useGameBanner(selectedGames[0]?.banner, 'desktop');

  const gameOptions = GAME_LIST.map((g) => ({ value: g.id, label: g.name }));

  const canSubmit =
    selectedGameIds.length > 0 && resolution !== null && !!quality;

  function handleConfirm() {
    setShowConfirm(false);
    setSubmitted(true);
    if (selectedGames.length > 0 && resolution !== null) {
      onSubmit?.({
        games: selectedGames,
        resolution,
        quality,
        budgetMin: budget[0],
        budgetMax: budget[1],
      });
    }
  }
  console.log(bannerSrc);
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* ── Game cover background ──────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: bannerSrc ? `url('${bannerSrc}')` : 'none',
          opacity: bannerSrc ? 1 : 0,
        }}
      />

      {/* Overall dim — keeps text legible regardless of cover brightness */}
      <div aria-hidden className="absolute inset-0 bg-black/45" />

      {/* ── Bottom blur-gradient (bottom 65% of screen) ───────────────── */}
      {/* Gradient layer: dark at bottom, transparent at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.72) 40%, transparent 100%)',
        }}
      />
      {/* Blur layer: masked so blur only appears in the lower half */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] backdrop-blur-xl"
        style={{
          WebkitMaskImage:
            'linear-gradient(to top, black 0%, black 35%, transparent 80%)',
          maskImage:
            'linear-gradient(to top, black 0%, black 35%, transparent 80%)',
        }}
      />

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onBack}
        className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-black/40"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back
      </button>

      {/* ── Centered form ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-md flex-col gap-8">
          {/* 1. Game */}
          <div>
            <FieldLabel>Game</FieldLabel>
            <GlassCombobox
              options={gameOptions}
              value={selectedGameIds}
              onChange={setSelectedGameIds}
              placeholder="Choose one or more games…"
            />
          </div>

          {/* 2. Resolution */}
          <div>
            <FieldLabel>Resolution</FieldLabel>
            <PillGroup
              options={(resolutions as readonly number[]).map(String)}
              value={resolution !== null ? String(resolution) : ''}
              onChange={(v) => setResolution(Number(v))}
              formatLabel={(v) => RESOLUTION_LABELS[Number(v)] ?? v}
            />
          </div>

          {/* 3. Quality */}
          <div>
            <FieldLabel>Graphics Quality</FieldLabel>
            <PillGroup
              options={[...graphicsQualities]}
              value={quality}
              onChange={setQuality}
            />
          </div>

          {/* 4. Budget */}
          <div>
            <FieldLabel>Budget</FieldLabel>
            <div className="mb-3 text-center">
              <span className="text-2xl font-bold tabular-nums text-white">
                ${budget[0].toLocaleString()}
              </span>
              <span className="mx-2 text-lg text-white/40">–</span>
              <span className="text-2xl font-bold tabular-nums text-white">
                ${budget[1].toLocaleString()}
              </span>
            </div>
            <BudgetSlider value={budget} onChange={setBudget} />
          </div>
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center px-6">
        <button
          type="button"
          onClick={() => canSubmit && setShowConfirm(true)}
          disabled={!canSubmit}
          className="h-12 w-full max-w-md rounded-2xl bg-white text-sm font-bold text-black shadow-lg transition-all hover:bg-white/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
        >
          Find my build
        </button>
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      {showConfirm && !submitted && (
        <ConfirmationOverlay
          games={selectedGames}
          resolution={resolution}
          quality={quality}
          budget={budget}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {submitted && <SuccessOverlay onDone={onBack} />}
    </div>
  );
}
