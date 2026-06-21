import { ConfirmDeleteModal } from '@/src/components/confirm-delete-modal';
import { Button } from '@heroui/react';
import { TrashIcon } from '@heroicons/react/16/solid';
import type { CpuResponseDto, GpuResponseDto, RamResponseDto } from '../../types/dtos';
import { HardwareSection } from './hardware-section';
import { Spec } from './spec';

export function HardwareDetail({
  gpu,
  cpu,
  ram,
  canDelete,
  isDeleting,
  onDelete,
}: {
  gpu?: GpuResponseDto;
  cpu?: CpuResponseDto;
  ram?: RamResponseDto;
  canDelete?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 p-4 pt-3 border-t bg-muted/10">
      {/* GPU */}
      {gpu && (
        <HardwareSection title="GPU">
          <Spec label="Brand" value={gpu.brand} />
          <Spec label="Family" value={gpu.family} />
          <Spec label="Series" value={gpu.series} />
          <Spec
            label="VRAM"
            value={`${gpu.memory_amount} GB ${gpu.memory_gen}`}
          />
          <Spec label="Shader cores" value={gpu.cores.toLocaleString()} />
          <Spec label="PCIe" value={`Gen ${gpu.pci_express}`} />
          <Spec label="TDP" value={`${gpu.recommended_power} W`} />
          <Spec
            label="Avg price"
            value={`$${gpu.avg_price.toLocaleString()}`}
          />
        </HardwareSection>
      )}

      {/* CPU */}
      {cpu && (
        <HardwareSection title="CPU">
          <Spec label="Brand" value={cpu.brand} />
          <Spec label="Generation" value={cpu.gen} />
          <Spec label="Family" value={cpu.family} />
          <Spec label="Series" value={cpu.series} />
          <Spec
            label="Cores / Threads"
            value={`${cpu.cores} / ${cpu.threads}`}
          />
          <Spec label="Base clock" value={`${cpu.base_clock} GHz`} />
          <Spec label="Max clock" value={`${cpu.max_clock} GHz`} />
          <Spec label="Cache" value={`${cpu.cache} MB`} />
          <Spec label="Socket" value={cpu.socket} />
          <Spec label="iGPU" value={cpu.graphics ? 'Yes' : 'No'} />
          <Spec label="Overclockable" value={cpu.oc ? 'Yes' : 'No'} />
          <Spec label="TDP" value={`${cpu.recommended_power} W`} />
          <Spec
            label="Avg price"
            value={`$${cpu.avg_price.toLocaleString()}`}
          />
        </HardwareSection>
      )}

      {/* RAM */}
      {ram && (
        <HardwareSection title="RAM">
          <Spec label="Brand" value={ram.brand} />
          <Spec label="Series" value={ram.series} />
          <Spec label="Type" value={ram.ddr} />
          <Spec label="Capacity" value={`${ram.memory_amount} GB`} />
          <Spec label="Frequency" value={`${ram.frequency_mhz} MHz`} />
          <Spec
            label="Avg price"
            value={`$${ram.avg_price.toLocaleString()}`}
          />
        </HardwareSection>
      )}

      {canDelete && onDelete && (
        <div
          className="sm:col-span-3 flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <ConfirmDeleteModal
            title="Delete Benchmark"
            description="Are you sure you want to delete this benchmark? This action cannot be undone."
            confirmLabel="Yes, delete benchmark"
            onConfirm={onDelete}
            isLoading={!!isDeleting}
            trigger={
              <Button size="sm" variant="danger">
                <TrashIcon className="size-3.5" />
                Delete benchmark
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
