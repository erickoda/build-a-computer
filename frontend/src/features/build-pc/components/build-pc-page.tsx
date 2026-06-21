'use client';

import { MilkyWayField } from '@/src/components/milky-way-field';
import useFetchGames from '@/src/features/games/hooks/fetchGames';
import { bytesToDataUrl } from '@/src/features/games/utils/imageBytes';
import { graphicsQualities, resolutions } from '@/src/utils/benchmarks';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { toast } from '@heroui/react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import useGetRecommendation from '../hooks/getRecommendation';
import { PcResponseDto } from '../types/dtos';
import { RecommendationResultsOverlay } from './recommendation-results-overlay';

// ─── Game ─────────────────────────────────────────────────────────────────────
//
// Selectable game backed by the real catalog. `bannerUrl` is the game's
// uploaded image (decoded from its byte array) used to fill the background —
// games without an uploaded image simply render no background art for their
// panel, since not every catalog game is guaranteed to have one.

type Game = {
  id: string;
  name: string;
  bannerUrl?: string;
};

// ─── useAverageColor ──────────────────────────────────────────────────────────
// Samples the bottom strip of each selected game's banner, averages the RGB
// values weighted equally per panel, and returns a bg color + contrasting text.
// Falls back to transparent/white while loading or when no games are selected.

type AverageColor = { bg: string; text: 'white' | 'black' };

function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Takes game IDs (stable state primitives, not derived objects) so the effect
// dependency never produces a new reference on every render. `gamesById` is
// read inside the effect via closure rather than being a dependency, since by
// the time a game is selectable it has already been resolved from the fetch.
function useAverageColor(
  gameIds: string[],
  gamesById: Map<string, Game>,
): AverageColor {
  const [color, setColor] = useState<AverageColor>({
    bg: 'transparent',
    text: 'white',
  });
  const cacheRef = useRef<Map<string, [number, number, number]>>(new Map());

  // Stable string key — only changes when the actual selection changes.
  // Using this as the effect dependency avoids the infinite-loop caused by
  // depending on a derived Game[] array (new reference every render).
  const idsKey = gameIds.join(',');

  useEffect(() => {
    // No games selected — skip async work entirely.
    // Do NOT call setColor here synchronously; instead let the async path
    // handle the empty case so React never sees a setState in the effect body.
    if (idsKey === '') {
      // Schedule the reset after the current render cycle to avoid the
      // "setState synchronously within an effect" warning.
      const id = setTimeout(() => {
        setColor({ bg: 'transparent', text: 'white' });
      }, 0);
      return () => clearTimeout(id);
    }

    let cancelled = false;

    async function sample() {
      const ids = idsKey.split(',');
      const gameList = ids
        .map((id) => gamesById.get(id))
        .filter(Boolean) as Game[];
      if (gameList.length === 0) return;

      const SAMPLE_W = 64,
        SAMPLE_H = 1;
      const canvas = document.createElement('canvas');
      canvas.width = SAMPLE_W;
      canvas.height = SAMPLE_H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      let totalR = 0,
        totalG = 0,
        totalB = 0,
        totalWeight = 0;
      const w = 1 / gameList.length;

      await Promise.all(
        gameList.map(async (game) => {
          const url = game.bannerUrl;
          if (!url) return;
          if (cacheRef.current.has(url)) {
            const [r, g, b] = cacheRef.current.get(url)!;
            totalR += r * w;
            totalG += g * w;
            totalB += b * w;
            totalWeight += w;
            return;
          }
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const srcY = Math.floor(img.naturalHeight * 0.75);
              const srcH = Math.max(1, Math.floor(img.naturalHeight * 0.05));
              ctx.clearRect(0, 0, SAMPLE_W, SAMPLE_H);
              ctx.drawImage(
                img,
                0,
                srcY,
                img.naturalWidth,
                srcH,
                0,
                0,
                SAMPLE_W,
                SAMPLE_H,
              );
              const px = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
              let r = 0,
                g = 0,
                b = 0;
              const n = SAMPLE_W * SAMPLE_H;
              for (let i = 0; i < px.length; i += 4) {
                r += px[i];
                g += px[i + 1];
                b += px[i + 2];
              }
              r = Math.round(r / n);
              g = Math.round(g / n);
              b = Math.round(b / n);
              cacheRef.current.set(url, [r, g, b]);
              totalR += r * w;
              totalG += g * w;
              totalB += b * w;
              totalWeight += w;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = url;
          });
        }),
      );

      if (cancelled || totalWeight === 0) return;

      const blend = 0.55;
      const fr = Math.round((totalR / totalWeight) * blend);
      const fg = Math.round((totalG / totalWeight) * blend);
      const fb = Math.round((totalB / totalWeight) * blend);
      const lum = luminance(fr, fg, fb);
      setColor({
        bg: `rgb(${fr},${fg},${fb})`,
        text: lum > 0.35 ? 'black' : 'white',
      });
    }

    sample();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]); // stable string — no new reference on every render

  return color;
}

// ─── Derived data ─────────────────────────────────────────────────────────────

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
            backgroundImage: game.bannerUrl
              ? `url('${game.bannerUrl}')`
              : undefined,
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
            background: 'light-dark(#f8f8f8f0, #040404f0)',
            // 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0.65) 55%, transparent 100%)',
            filter: 'blur(21px)',
          }}
        />
      ))}

      {/* Black cover that fades away once any game is selected */}
      {/*<div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: count > 0 ? 0 : 1,
          transition: 'opacity 600ms ease',
        }}
      />*/}
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
    '[&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-white',
    '[&::-webkit-slider-thumb]:border-2',
    '[&::-webkit-slider-thumb]:border-black/20',
    '[&::-webkit-slider-thumb]:shadow-md',
    '[&::-webkit-slider-thumb]:cursor-grab',
    '[&::-webkit-slider-thumb]:active:cursor-grabbing',
    '[&::-webkit-slider-runnable-track]:bg-transparent',
    '[&::-moz-range-thumb]:pointer-events-auto',
    '[&::-moz-range-thumb]:size-4',
    '[&::-moz-range-thumb]:rounded-full',
    '[&::-moz-range-thumb]:bg-black dark:[&::-moz-range-thumb]:bg-white',
    '[&::-moz-range-thumb]:border-2',
    '[&::-moz-range-thumb]:border-black/20',
    '[&::-moz-range-thumb]:cursor-grab',
    '[&::-moz-range-track]:bg-transparent',
  ].join(' ');

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative flex h-5 items-center">
        <div className="absolute h-1 w-full rounded-full bg-black/20 dark:bg-white/20" />
        <div
          className="absolute h-1 rounded-full bg-black dark:bg-white transition-all duration-75"
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
      <div className="flex justify-between text-xs text-black/40 dark:text-white/40">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/85 p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 fade-in duration-200 dark:border-white/20 dark:bg-black/70"
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

// ─── Field label ──────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
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
  const [recommendations, setRecommendations] = useState<PcResponseDto[]>([]);

  const { games: fetchedGames, fetchGames } = useFetchGames();
  const { getRecommendation } = useGetRecommendation();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const gameList: Game[] = useMemo(
    () =>
      fetchedGames.map((g) => ({
        id: g.id,
        name: g.name,
        bannerUrl: bytesToDataUrl(g.img),
      })),
    [fetchedGames],
  );
  const gamesById = useMemo(
    () => new Map(gameList.map((g) => [g.id, g])),
    [gameList],
  );

  const selectedGames = selectedGameIds
    .map((id) => gamesById.get(id))
    .filter(Boolean) as Game[];
  const gameOptions = gameList.map((g) => ({ value: g.id, label: g.name }));
  const canSubmit =
    selectedGameIds.length > 0 && resolution !== null && !!quality;

  const [btnHovered, setBtnHovered] = useState(false);
  // Pass the stable ID array (not the derived Game[] object) to avoid
  // a new array reference on every render triggering the effect infinitely.
  const accentColor = useAverageColor(selectedGameIds, gamesById);

  const handleConfirm = useCallback(async () => {
    setShowConfirm(false);

    if (selectedGames.length === 0 || resolution === null) return;

    const result = await getRecommendation({
      games: selectedGameIds,
      maxPrice: budget[1],
      resolution,
      computerPerformance: quality.toLowerCase(),
    });

    if (!result.ok) {
      toast.danger('Could not build your recommendation', {
        description: result.error.message || 'Please try again later.',
      });
      return;
    }

    setRecommendations(result.data);
    setSubmitted(true);
    onSubmit?.({
      games: selectedGames,
      resolution,
      quality,
      budgetMin: budget[0],
      budgetMax: budget[1],
    });
  }, [
    selectedGameIds,
    selectedGames,
    resolution,
    quality,
    budget,
    onSubmit,
    getRecommendation,
  ]);

  const handleDone = useCallback(() => {
    setSubmitted(false);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white dark:bg-black">
      <MilkyWayField />

      {/* ── Split game cover background ────────────────────────────────── */}
      <SplitBackground games={selectedGames} />

      {/* Overall dim — keeps content legible regardless of art brightness */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-neutral-300/45 dark:bg-black/45"
      />

      {/* ── Bottom blur-gradient ───────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
        style={{
          background:
            'light-dark(linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.72) 40%, transparent 100%), linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.72) 40%, transparent 100%))',
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

      {/* ── Centered form — pb-28 keeps content clear of the fixed button */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-28">
        <div
          className={[
            'flex w-full max-w-md flex-col gap-8',
            'px-5 py-5 rounded-lg',
            'border-black/8 bg-white/30 dark:border-white/8 dark:bg-black/30',
            'backdrop-blur-[30px]',
            'shadow-[inset_0_1px_0_rgba(0,0,0,0.06),0_2px_16px_rgba(110,175,212,0.30)]',
            'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(110,175,212,0.25)]',
            ,
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
              <span className="text-2xl font-bold tabular-nums text-black dark:text-white">
                ${budget[0].toLocaleString()}
              </span>
              <span className="mx-2 text-lg text-black/40 dark:text-white/40">
                –
              </span>
              <span className="text-2xl font-bold tabular-nums text-black dark:text-white">
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
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          className={[
            'h-14 w-full max-w-md rounded-2xl text-base font-bold shadow-lg backdrop-blur-[50px]',
            'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30',
          ].join(' ')}
          style={{
            // Sampled from the game banner(s) — transitions smoothly as games change
            backgroundColor:
              accentColor.bg === 'transparent'
                ? 'light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.15))'
                : accentColor.bg,
            color: accentColor.text,
            filter: btnHovered ? 'brightness(1.08)' : 'brightness(1)',
            // Smooth color transition as games are added/removed/changed
            transition: [
              'background-color 800ms cubic-bezier(0.4,0,0.2,1)',
              'color 400ms ease',
              'filter 200ms ease',
              'box-shadow 200ms ease',
              'transform 150ms ease',
            ].join(', '),
            boxShadow: btnHovered
              ? '0 0px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(110,175,212,0.30)'
              : '0 0px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(110,175,212,0.18)',
          }}
        >
          {/*'h-12 w-full max-w-md rounded-2xl text-sm font-bold',
            'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(110,175,212,0.25)]',
            'hover:bg-mist-800/85',
            'duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30',
            // 'flex flex-col items-center gap-3 px-3 py-10 text-center rounded-lg',
            // 'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'border-white/8 bg-mist-800/75',
            'backdrop-blur-[50px]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_16px_rgba(110,175,212,0.15)]'
            */}
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

      {submitted && (
        <RecommendationResultsOverlay
          pcs={recommendations}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
