'use client';

import { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import { PcResponseDto } from '../types/dtos';

type RecommendationResultsOverlayProps = {
  pcs: PcResponseDto[];
  onDone: () => void;
};

function totalPrice(pc: PcResponseDto): number {
  return (
    pc.cpu.avg_price +
    pc.gpu.avg_price +
    pc.ram_memory.avg_price +
    pc.mother_board.avg_price +
    pc.power_source.avg_price +
    pc.ssd.avg_price
  );
}

type SpecRowProps = { label: string; value: string; price: number };

function SpecRow({ label, value, price }: SpecRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-white">{value}</p>
      </div>
      <span className="shrink-0 text-sm tabular-nums text-white/60">
        ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}

function PcCard({ pc, index }: { pc: PcResponseDto; index: number }) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-1 rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-xl">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-bold text-white">Build #{index + 1}</h3>
        <span className="text-lg font-bold tabular-nums text-white">
          $
          {totalPrice(pc).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
      <div className="flex flex-col divide-y divide-white/10">
        <SpecRow
          label="CPU"
          value={`${pc.cpu.brand} ${pc.cpu.series}`}
          price={pc.cpu.avg_price}
        />
        <SpecRow
          label="GPU"
          value={`${pc.gpu.brand} ${pc.gpu.series}`}
          price={pc.gpu.avg_price}
        />
        <SpecRow
          label="Motherboard"
          value={`${pc.mother_board.brand} ${pc.mother_board.series}`}
          price={pc.mother_board.avg_price}
        />
        <SpecRow
          label="RAM"
          value={`${pc.ram_memory.brand} ${pc.ram_memory.memory_amount}GB ${pc.ram_memory.ddr}`}
          price={pc.ram_memory.avg_price}
        />
        <SpecRow
          label="Storage"
          value={`${pc.ssd.brand} ${pc.ssd.amount}GB ${pc.ssd.type}`}
          price={pc.ssd.avg_price}
        />
        <SpecRow
          label="Power Supply"
          value={`${pc.power_source.brand} ${pc.power_source.power_amount}W`}
          price={pc.power_source.avg_price}
        />
      </div>
    </div>
  );
}

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
