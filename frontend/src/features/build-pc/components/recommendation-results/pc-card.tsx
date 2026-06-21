import { PcResponseDto } from '../../types/dtos';
import { SpecRow } from './spec-row';

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

export function PcCard({ pc, index }: { pc: PcResponseDto; index: number }) {
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
