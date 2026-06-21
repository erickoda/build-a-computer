import { useCurrentUserId } from '@/src/hooks/use-current-user-id';
import { Button, Input, Separator } from '@heroui/react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useCreateBenchmark from '../hooks/createBenchmark';
import useFetchCpus from '../hooks/fetchCpus';
import useFetchGames from '../hooks/fetchGames';
import useFetchGpus from '../hooks/fetchGpus';
import useFetchRams from '../hooks/fetchRams';
import { CreateBenchmarkFormValues, createBenchmarkSchema } from '../schemas/createBenchmarkSchema';
import { CreateBenchmarkRequestDto, graphicsQualities, resolutions } from '../types/dtos';
import { type ComboboxOption, HardwareCombobox } from './create-benchmark/hardware-combobox';
import { Field } from '@/src/components/form-field';
import { PageHeader } from './create-benchmark/page-header';
import { SectionHeader } from '@/src/components/section-header';
import { SuccessMessage } from './create-benchmark/success-message';

// ─── Main page ────────────────────────────────────────────────────────────────

type CreateBenchmarkPageProps = {
  onBack: () => void;
};

const EMPTY_VALUES: CreateBenchmarkFormValues = {
  title: '',
  gpu_id: '',
  cpu_id: '',
  ram_id: '',
  game_id: '',
  resolution: '',
  graphics_quality: '',
  avg_fps: '',
  min_fps: '',
  max_fps: '',
  score: '',
};

export function CreateBenchmarkPage({ onBack }: CreateBenchmarkPageProps) {
  const userId = useCurrentUserId();

  const { gpus, fetchGpus } = useFetchGpus();
  const { cpus, fetchCpus } = useFetchCpus();
  const { rams, fetchRams } = useFetchRams();
  const { games, fetchGames } = useFetchGames();
  const { isLoading: isSubmitting, error: submitError, createBenchmarkRequest } = useCreateBenchmark();

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchGpus();
    fetchCpus();
    fetchRams();
    fetchGames();
  }, [fetchGpus, fetchCpus, fetchRams, fetchGames]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateBenchmarkFormValues>({
    resolver: zodResolver(createBenchmarkSchema),
    mode: 'onChange',
    defaultValues: EMPTY_VALUES,
  });

  const gpuOptions: ComboboxOption[] = gpus.map((g) => ({
    value: g.id,
    label: `${g.brand} ${g.family} ${g.series}`,
    description: `${g.memory_amount}GB ${g.memory_gen} · ${g.cores.toLocaleString()} cores · ~$${g.avg_price.toLocaleString()}`,
  }));

  const cpuOptions: ComboboxOption[] = cpus.map((c) => ({
    value: c.id,
    label: `${c.brand} ${c.family} ${c.series}`,
    description: `${c.cores}C/${c.threads}T · ${c.max_clock} GHz · ${c.socket} · ~$${c.avg_price.toLocaleString()}`,
  }));

  const ramOptions: ComboboxOption[] = rams.map((r) => ({
    value: r.id,
    label: `${r.brand} ${r.series} ${r.memory_amount}GB ${r.ddr}`,
    description: `${r.frequency_mhz} MHz · ~$${r.avg_price.toLocaleString()}`,
  }));

  const gameOptions: ComboboxOption[] = games.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  const qualityOptions: ComboboxOption[] = graphicsQualities.map((q) => ({
    value: q.toLowerCase(),
    label: q,
  }));

  const resolutionOptions: ComboboxOption[] = resolutions.map((r) => ({
    value: String(r),
    label:
      r === 2160
        ? '4K · 3840 × 2160'
        : r === 1440
          ? '1440p · 2560 × 1440'
          : '1080p · 1920 × 1080',
  }));

  const onSubmit = async (data: CreateBenchmarkFormValues) => {
    if (!userId) return;

    const payload: CreateBenchmarkRequestDto = {
      title: data.title,
      gpu_id: data.gpu_id,
      cpu_id: data.cpu_id,
      ram_id: data.ram_id,
      game_id: data.game_id,
      resolution: Number(data.resolution),
      graphics_quality: data.graphics_quality,
      avg_fps: Number(data.avg_fps),
      min_fps: Number(data.min_fps),
      max_fps: Number(data.max_fps),
      score: data.score ? Number(data.score) : undefined,
      user_id: userId,
    };

    const isSuccess = await createBenchmarkRequest(payload);

    if (isSuccess) {
      setSubmitted(true);
    }
  };

  function handleAnother() {
    reset(EMPTY_VALUES);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <PageHeader onBack={onBack} />
        <SuccessMessage onAnother={handleAnother} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <PageHeader onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto max-w-2xl px-4 sm:px-6 py-8 pb-36"
        >
          <div className="flex flex-col gap-10">
            {/* ── Overview ──────────────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <SectionHeader
                title="Overview"
                subtitle="Give this benchmark run a short, descriptive title."
              />

              <Field label="Title" htmlFor="title" error={errors.title?.message} required>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="title"
                      placeholder="e.g. RTX 4090 — Elden Ring 4K Ultra"
                      disabled={isSubmitting}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </Field>
            </section>

            <Separator />

            {/* ── Hardware ─────────────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <SectionHeader
                title="Hardware"
                subtitle="Select the exact components used during this benchmark run."
              />

              <Field
                label="GPU"
                htmlFor="gpu_id"
                error={errors.gpu_id?.message}
                required
              >
                <Controller
                  name="gpu_id"
                  control={control}
                  render={({ field }) => (
                    <HardwareCombobox
                      id="gpu_id"
                      options={gpuOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select a GPU…"
                      emptyMessage="No GPUs match your search."
                    />
                  )}
                />
              </Field>

              <Field
                label="CPU"
                htmlFor="cpu_id"
                error={errors.cpu_id?.message}
                required
              >
                <Controller
                  name="cpu_id"
                  control={control}
                  render={({ field }) => (
                    <HardwareCombobox
                      id="cpu_id"
                      options={cpuOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select a CPU…"
                      emptyMessage="No CPUs match your search."
                    />
                  )}
                />
              </Field>

              <Field
                label="RAM"
                htmlFor="ram_id"
                error={errors.ram_id?.message}
                required
              >
                <Controller
                  name="ram_id"
                  control={control}
                  render={({ field }) => (
                    <HardwareCombobox
                      id="ram_id"
                      options={ramOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select RAM…"
                      emptyMessage="No RAM modules match your search."
                    />
                  )}
                />
              </Field>
            </section>

            <Separator />

            {/* ── Test Configuration ───────────────────────────── */}
            <section className="flex flex-col gap-5">
              <SectionHeader
                title="Test Configuration"
                subtitle="Define the game, resolution, and quality settings used."
              />

              <Field
                label="Game"
                htmlFor="game_id"
                error={errors.game_id?.message}
                required
              >
                <Controller
                  name="game_id"
                  control={control}
                  render={({ field }) => (
                    <HardwareCombobox
                      id="game_id"
                      options={gameOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select a game…"
                      emptyMessage="No games match your search."
                    />
                  )}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Resolution"
                  htmlFor="resolution"
                  error={errors.resolution?.message}
                  required
                >
                  <Controller
                    name="resolution"
                    control={control}
                    render={({ field }) => (
                      <HardwareCombobox
                        id="resolution"
                        options={resolutionOptions}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        placeholder="Select…"
                        emptyMessage="No resolutions found."
                      />
                    )}
                  />
                </Field>

                <Field
                  label="Graphics Quality"
                  htmlFor="graphics_quality"
                  error={errors.graphics_quality?.message}
                  required
                >
                  <Controller
                    name="graphics_quality"
                    control={control}
                    render={({ field }) => (
                      <HardwareCombobox
                        id="graphics_quality"
                        options={qualityOptions}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        placeholder="Select…"
                        emptyMessage="No presets found."
                      />
                    )}
                  />
                </Field>
              </div>
            </section>

            <Separator />

            {/* ── Performance Results ──────────────────────────── */}
            <section className="flex flex-col gap-5">
              <SectionHeader
                title="Performance Results"
                subtitle="Enter the FPS values recorded during the benchmark session."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field
                  label="Avg FPS"
                  htmlFor="avg_fps"
                  error={errors.avg_fps?.message}
                  required
                >
                  <Controller
                    name="avg_fps"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="avg_fps"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={9999}
                        placeholder="e.g. 120"
                        disabled={isSubmitting}
                        className={errors.avg_fps ? 'border-destructive' : ''}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Field>

                <Field
                  label="Min FPS"
                  htmlFor="min_fps"
                  error={errors.min_fps?.message}
                  required
                >
                  <Controller
                    name="min_fps"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="min_fps"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={9999}
                        placeholder="e.g. 95"
                        disabled={isSubmitting}
                        className={errors.min_fps ? 'border-destructive' : ''}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Field>

                <Field
                  label="Max FPS"
                  htmlFor="max_fps"
                  error={errors.max_fps?.message}
                  required
                >
                  <Controller
                    name="max_fps"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="max_fps"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={9999}
                        placeholder="e.g. 147"
                        disabled={isSubmitting}
                        className={errors.max_fps ? 'border-destructive' : ''}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Field>
              </div>

              <Field
                label="Score"
                htmlFor="score"
                error={errors.score?.message}
              >
                <div className="flex items-center gap-3">
                  <Controller
                    name="score"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="score"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={99999}
                        placeholder="0000"
                        disabled={isSubmitting}
                        className={`max-w-[120px] ${errors.score ? 'border-destructive' : ''}`}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <span className="text-xs text-muted-foreground">
                    The score you got on your benchmark
                  </span>
                </div>
              </Field>
            </section>
          </div>
        </form>
      </div>

      {/* ── Sticky save bar ──────────────────────────────────────────────── */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-4">
        {submitError && (
          <p className="mb-3 text-center text-sm text-destructive">
            {submitError.message || 'Failed to save benchmark. Please try again.'}
          </p>
        )}
        <div className="mx-auto max-w-2xl">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            onPress={() => void handleSubmit(onSubmit)()}
            isPending={isSubmitting}
            isDisabled={isSubmitting || !isValid}
          >
            Save Benchmark
          </Button>
        </div>
      </div>
    </div>
  );
}
