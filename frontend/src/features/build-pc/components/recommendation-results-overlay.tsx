'use client';

import { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import { PcResponseDto } from '../types/dtos';
import { PcCard } from './recommendation-results/pc-card';

type RecommendationResultsOverlayProps = {
  pcs: PcResponseDto[];
  onDone: () => void;
};

export function RecommendationResultsOverlay({
  pcs,
  onDone,
}: RecommendationResultsOverlayProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDone();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-y-auto bg-black/70 px-6 py-12 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onDone}
    >
      <div
        className="flex max-h-full w-full max-w-5xl flex-col items-center gap-6 overflow-y-auto animate-in zoom-in-95 fade-in duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {pcs.length > 0 ? (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <CheckCircleIcon className="size-7 text-white" />
              </div>
              <p className="text-xl font-bold text-white">
                Here are your recommended builds
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {pcs.map((pc, i) => (
                <PcCard key={i} pc={pc} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xl font-bold text-white">No matching builds</p>
            <p className="text-sm text-white/60">
              Try adjusting your budget, resolution or quality settings.
            </p>
          </div>
        )}
        <p className="text-xs text-white/30">
          Click anywhere or press ESC to close
        </p>
      </div>
    </div>
  );
}
