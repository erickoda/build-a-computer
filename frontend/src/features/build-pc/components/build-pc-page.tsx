'use client';

import { MilkyWayField } from '@/src/components/milky-way-field';
import useFetchGames from '@/src/features/games/hooks/fetchGames';
import { bytesToDataUrl } from '@/src/features/games/utils/imageBytes';
import { graphicsQualities, resolutions } from '@/src/utils/benchmarks';
import { toast } from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useGetRecommendation from '../hooks/getRecommendation';
import { useAverageColor } from '../hooks/useAverageColor';
import { PcResponseDto } from '../types/dtos';
import { Game } from '../types/game';
import { RESOLUTION_LABELS } from '../constants';
import { BudgetSlider } from './budget-slider';
import { ConfirmationOverlay } from './confirmation-overlay';
import { FieldLabel } from './field-label';
import { GlassCombobox } from './glass-combobox';
import { PillGroup } from './pill-group';
import { RecommendationResultsOverlay } from './recommendation-results-overlay';
import { SplitBackground } from './split-background';

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
