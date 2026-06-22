import { ConfirmDeleteModal } from '@/src/components/confirm-delete-modal';
import { TrashIcon } from '@heroicons/react/16/solid';
import { Button } from '@heroui/react';
import type {
  CpuResponseDto,
  GpuResponseDto,
  RamResponseDto,
} from '../../types/dtos';
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
    // @container: column count below responds to *this component's own*
    // available width, not the viewport. Necessary because HardwareDetail
    // renders in genuinely different width contexts — a full-width panel
    // below a list row, a full-width mobile modal, but also a narrow
    // flex-1 sideways panel next to a grid card's ~288px summary sidebar.
    // A viewport-based `sm:grid-cols-3` doesn't know about that last case:
    // the screen can easily be wide while this panel's own space is not,
    // which is what was squeezing the GPU/CPU/RAM cards. Container queries
    // size based on the nearest `@container` ancestor instead of the
    // viewport, so 3 columns only ever appear when there's actually room.
    <div className="@container">
      <div className="grid grid-cols-1 gap-3 @lg:grid-cols-3 p-3 pt-3 border-t bg-muted/10">
        {/* GPU — title: Brand Family Series, e.g. "NVIDIA GeForce RTX 4090" */}
        {gpu && (
          <HardwareSection
            kicker="GPU"
            title={`${gpu.brand} ${gpu.family} ${gpu.series}`}
            heroSpecs={
              <>
                <Spec
                  variant="hero"
                  label="VRAM"
                  value={`${gpu.memory_amount} GB ${gpu.memory_gen}`}
                />
                <Spec
                  variant="hero"
                  label="Shader cores"
                  value={gpu.cores.toLocaleString()}
                />
              </>
            }
          >
            <Spec label="PCIe" value={`Gen ${gpu.pci_express}`} />
            <Spec label="TDP" value={`${gpu.recommended_power} W`} />
            <Spec
              label="Avg price"
              value={`$${gpu.avg_price.toLocaleString()}`}
            />
          </HardwareSection>
        )}

        {/* CPU — title: Brand Family Series, e.g. "Intel Core i9 13900K".
            Generation moves out of the title into the spec grid below. */}
        {cpu && (
          <HardwareSection
            kicker="CPU"
            title={`${cpu.brand} ${cpu.family} ${cpu.series}`}
            heroSpecs={
              <>
                <Spec
                  variant="hero"
                  label="Cores / Threads"
                  value={`${cpu.cores}/${cpu.threads}`}
                />
                <Spec
                  variant="hero"
                  label="Clock"
                  value={`${cpu.base_clock}–${cpu.max_clock} GHz`}
                />
              </>
            }
          >
            <Spec label="Generation" value={cpu.gen} />
            <Spec label="Socket" value={cpu.socket} />
            <Spec label="Cache" value={`${cpu.cache} MB`} />
            <Spec label="TDP" value={`${cpu.recommended_power} W`} />
            <Spec label="iGPU" value={cpu.graphics ? 'Yes' : 'No'} />
            <Spec label="Overclockable" value={cpu.oc ? 'Yes' : 'No'} />
            <Spec
              label="Avg price"
              value={`$${cpu.avg_price.toLocaleString()}`}
            />
          </HardwareSection>
        )}

        {/* RAM — title: Brand Series, e.g. "Corsair Vengeance" */}
        {ram && (
          <HardwareSection
            kicker="RAM"
            title={`${ram.brand} ${ram.series}`}
            heroSpecs={
              <>
                <Spec
                  variant="hero"
                  label="Capacity"
                  value={`${ram.memory_amount} GB`}
                />
                <Spec
                  variant="hero"
                  label="Speed"
                  value={`${ram.frequency_mhz} MHz`}
                />
              </>
            }
          >
            <Spec label="Type" value={ram.ddr} />
            <Spec
              label="Avg price"
              value={`$${ram.avg_price.toLocaleString()}`}
            />
          </HardwareSection>
        )}

        {canDelete && onDelete && (
          <div
            className="@lg:col-span-3 flex justify-end"
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
    </div>
  );
}
