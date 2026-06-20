'use client';

import AuthButton from '@/src/components/auth-button';
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
import { Button } from '@heroui/react';
import { useCallback, useEffect, useId, useState } from 'react';

// ─── Banner hook ──────────────────────────────────────────────────────────────
//
// Files must live in /public/banners/ at the project root.
// Next.js serves /public/ at the URL root, so:
//   /public/banners/elden-ring-desktop.png  →  /banners/elden-ring-desktop.png

type BannerSize = 'desktop' | 'tablet' | 'mobile';

function useGameBanner(
  banner: string | undefined,
  size: BannerSize = 'desktop',
): string | null {
  if (!banner) return null;
  return `/banners/${banner}-${size}.png`;
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
const BUDGET_MAX = 10000;
const BUDGET_STEP = 50;

// ─── Split background ─────────────────────────────────────────────────────────
// Renders one panel per selected game, equally wide, side by side.
// Each panel animates its width and opacity independently.

type SplitBackgroundProps = { games: Game[] };

// Seam width in px — straddles each boundary equally on both sides
const SEAM_WIDTH = 80;

function SplitBackground({ games: selectedGames }: SplitBackgroundProps) {
  const count = selectedGames.length;
  const widthPct = count > 0 ? 100 / count : 100;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* One panel per game */}
      {selectedGames.map((game, i) => (
        <div
          key={game.id}
          className="absolute top-0 h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/${game.banner}-desktop.png')`,
            width: `${widthPct}%`,
            left: `${i * widthPct}%`,
            transition:
              'width 800ms cubic-bezier(0.4,0,0.2,1), left 600ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      ))}

      {/* Seams — one per internal boundary, rendered as siblings so they are
          never clipped by a panel's own box. Each seam is centred on the
          boundary using calc() so it tracks the % position during the
          CSS transition without needing JS scroll listeners. */}
      {selectedGames.slice(0, -1).map((game, i) => (
        <div
          key={`seam-${game.id}`}
          className="absolute -top-10 h-full pointer-events-none"
          style={{
            width: SEAM_WIDTH,
            left: `calc(${(i + 1) * widthPct}% - ${SEAM_WIDTH / 2}px)`,
            transition: 'left 600ms cubic-bezier(0.4,0,0.2,1)',
            background: 'black',
            // 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0.65) 55%, transparent 100%)',
            filter: 'blur(21px)',
          }}
        />
      ))}

      {/* Black cover that fades away once any game is selected */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: count > 0 ? 0 : 1,
          transition: 'opacity 600ms ease',
        }}
      />
    </div>
  );
}

// ─── Glass multi-select combobox ──────────────────────────────────────────────

type GlassComboboxProps = {
  options: { value: string; label: string }[];
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
        <ChevronUpDownIcon
          className={`size-4 shrink-0 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/20 bg-black/60 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
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
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-all duration-150 ${isSelected ? 'border-white bg-white' : 'border-white/30'}`}
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
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 animate-in fade-in duration-150">
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
          className={`h-9 rounded-lg border px-4 text-sm font-medium transition-all duration-200 ${
            value === opt
              ? 'border-white bg-white text-black scale-105'
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
// Both inputs are stacked absolutely. Without pointer-events isolation, the top
// input intercepts all clicks — making the low thumb unreachable on the left.
// Fix: pointer-events:none on inputs, pointer-events:auto on thumbs only.

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

  const rangeClass = [
    'absolute w-full appearance-none bg-transparent',
    'pointer-events-none',
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:pointer-events-auto',
    '[&::-webkit-slider-thumb]:size-4',
    '[&::-webkit-slider-thumb]:rounded-full',
    '[&::-webkit-slider-thumb]:bg-white',
    '[&::-webkit-slider-thumb]:border-2',
    '[&::-webkit-slider-thumb]:border-black/20',
    '[&::-webkit-slider-thumb]:shadow-md',
    '[&::-webkit-slider-thumb]:cursor-grab',
    '[&::-webkit-slider-thumb]:active:cursor-grabbing',
    '[&::-webkit-slider-runnable-track]:bg-transparent',
    '[&::-moz-range-thumb]:pointer-events-auto',
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
      <div className="relative flex h-5 items-center">
        <div className="absolute h-1 w-full rounded-full bg-white/20" />
        <div
          className="absolute h-1 rounded-full bg-white transition-all duration-75"
          style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }}
        />
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
    // Backdrop: click outside to cancel
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/20 bg-black/70 p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
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
              <span className="text-right text-sm font-medium text-white">
                {value}
              </span>
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
  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDone();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  return (
    // Backdrop: click outside to close
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
      onClick={onDone}
    >
      <div
        className="flex flex-col items-center gap-5 text-center animate-in zoom-in-95 fade-in duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex size-20 items-center justify-center rounded-full border border-white/20 bg-white/10">
          <CheckCircleIcon className="size-10 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">Request sent</p>
          <p className="mt-1 text-sm text-white/60">
            We'll find the best builds for your configuration.
          </p>
        </div>
        {/*<button
          type="button"
          onClick={onDone}
          className="mt-2 h-10 rounded-xl bg-white px-8 text-sm font-bold text-black transition-colors hover:bg-white/90"
        >
          Done
        </button>*/}
        <p className="text-xs text-white/30">
          Click anywhere or press ESC to close
        </p>
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
  const gameOptions = GAME_LIST.map((g) => ({ value: g.id, label: g.name }));
  const canSubmit =
    selectedGameIds.length > 0 && resolution !== null && !!quality;

  const handleConfirm = useCallback(() => {
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
  }, [selectedGames, resolution, quality, budget, onSubmit]);

  const handleDone = useCallback(() => {
    setSubmitted(false);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* ── Split game cover background ────────────────────────────────── */}
      <SplitBackground games={selectedGames} />

      {/* Overall dim — keeps content legible regardless of art brightness */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/45"
      />

      {/* ── Bottom blur-gradient ───────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.72) 40%, transparent 100%)',
        }}
      />
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

      {/* ── Back button — z-20 so it sits above all overlays ──────────── */}
      <Button
        type="button"
        onClick={onBack}
        className="absolute left-5 top-5 z-20 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-black/50 active:scale-95"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back
      </Button>

      <AuthButton className="absolute right-5 top-5 z-20" />

      {/* ── Centered form — pb-28 keeps content clear of the fixed button */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-28">
        <div
          className={[
            'flex w-full max-w-md flex-col gap-8',
            'px-5 py-5 rounded-lg',
            'border-white/8 bg-black/30',
            'backdrop-blur-[30px]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(212,175,110,0.25)]',
          ].join(' ')}
        >
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

      {/* ── Submit — fixed so it's always visible ─────────────────────── */}
      <div className="fixed inset-x-0 bottom-8 z-20 flex justify-center px-6">
        <button
          type="button"
          onClick={() => canSubmit && setShowConfirm(true)}
          disabled={!canSubmit}
          className="h-12 w-full max-w-md rounded-2xl bg-white text-sm font-bold text-black shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
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

      {submitted && <SuccessOverlay onDone={handleDone} />}
    </div>
  );
}
