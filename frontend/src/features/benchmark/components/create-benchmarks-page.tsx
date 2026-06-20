'use client';

import { useCurrentUserId } from '@/src/hooks/use-current-user-id';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/16/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
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
import { Combobox, type ComboboxOption } from './ui/combobox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

// ─── Success overlay ─────────────────────────────────────────────────────────

function SuccessMessage({ onAnother }: { onAnother: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-12 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircleIcon className="size-9 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold">Benchmark saved</h2>
        <p className="text-sm text-muted-foreground">
          Your benchmark has been submitted and will appear once indexed.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onAnother}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Add another
        </button>
        <Link
          href={'/benchmarks'}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to benchmarks
        </Link>
      </div>
    </div>
  );
}

// ─── Confirm back dialog ────────────────────────────────────────────────────

function ConfirmBackDialog({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-back-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <ExclamationTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 id="confirm-back-title" className="text-sm font-semibold">
              Leave this page?
            </h2>
            <p className="text-sm text-muted-foreground">
              Your benchmark hasn&apos;t been saved yet. Going back will discard
              everything you&apos;ve entered.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-input bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Stay on page
          </button>
          <Link
            href="/benchmarks"
            className="rounded-lg bg-destructive px-3.5 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Discard &amp; go back
          </Link>
        </div>
      </div>
    </div>
  );
}

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
  const [confirmBackOpen, setConfirmBackOpen] = useState(false);

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
    value: q,
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

  function requestBack() {
    setConfirmBackOpen(true);
  }

  function cancelBack() {
    setConfirmBackOpen(false);
  }

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
      <PageHeader onBack={requestBack} />

      <ConfirmBackDialog open={confirmBackOpen} onCancel={cancelBack} />

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto max-w-2xl px-6 py-8 pb-36"
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
                    <Combobox
                      id="gpu_id"
                      options={gpuOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select a GPU…"
                      searchPlaceholder="Search GPUs…"
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
                    <Combobox
                      id="cpu_id"
                      options={cpuOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select a CPU…"
                      searchPlaceholder="Search CPUs…"
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
                    <Combobox
                      id="ram_id"
                      options={ramOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select RAM…"
                      searchPlaceholder="Search RAM…"
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
                    <Combobox
                      id="game_id"
                      options={gameOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select a game…"
                      searchPlaceholder="Search games…"
                      emptyMessage="No games match your search."
                    />
                  )}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
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
                      <Combobox
                        id="resolution"
                        options={resolutionOptions}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        placeholder="Select…"
                        searchPlaceholder="Search…"
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
                      <Combobox
                        id="graphics_quality"
                        options={qualityOptions}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        placeholder="Select…"
                        searchPlaceholder="Search…"
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

              <div className="grid grid-cols-3 gap-4">
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
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm px-6 py-4">
        {submitError && (
          <p className="mb-3 text-center text-sm text-destructive">
            {submitError.message || 'Failed to save benchmark. Please try again.'}
          </p>
        )}
        <div className="mx-auto max-w-2xl">
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isValid}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="size-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              'Save Benchmark'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 border-b px-6 py-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 rounded-lg p-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground -ml-1.5"
      >
        <ArrowLeftIcon className="size-4" />
        <span>Back</span>
      </button>
      <Separator orientation="vertical" className="h-4" />
      <div>
        <h1 className="text-sm font-semibold">Add Benchmark</h1>
        <p className="text-xs text-muted-foreground">Admin only</p>
      </div>
    </header>
  );
}
