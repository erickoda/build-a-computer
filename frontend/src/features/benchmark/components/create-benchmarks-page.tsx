'use client';

import {
  cpus,
  games,
  gpus,
  graphicsQualities,
  rams,
  resolutions,
} from '@/src/utils/benchmarks';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/16/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';
import { Combobox, type ComboboxOption } from './ui/combobox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

// ─── Option builders ─────────────────────────────────────────────────────────

const gpuOptions: ComboboxOption[] = Object.values(gpus).map((g) => ({
  value: g.id,
  label: `${g.brand} ${g.family} ${g.series}`,
  description: `${g.memory_amount}GB ${g.memory_gen} · ${g.cores.toLocaleString()} cores · ~$${g.avg_price.toLocaleString()}`,
}));

const cpuOptions: ComboboxOption[] = Object.values(cpus).map((c) => ({
  value: c.id,
  label: `${c.brand} ${c.family} ${c.series}`,
  description: `${c.cores}C/${c.threads}T · ${c.max_clock} GHz · ${c.socket} · ~$${c.avg_price.toLocaleString()}`,
}));

const ramOptions: ComboboxOption[] = Object.values(rams).map((r) => ({
  value: r.id,
  label: `${r.brand} ${r.series} ${r.memory_amount}GB ${r.ddr}`,
  description: `${r.frequency_mhz} MHz · ~$${r.avg_price.toLocaleString()}`,
}));

const gameOptions: ComboboxOption[] = Object.values(games).map((g) => ({
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

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  gpu_id: string;
  cpu_id: string;
  ram_id: string;
  game_id: string;
  resolution: string;
  graphics_quality: string;
  avg_fps: string;
  min_fps: string;
  max_fps: string;
  score: string;
};

const EMPTY_FORM: FormState = {
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

// ─── Validation ───────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.gpu_id) errors.gpu_id = 'Select a GPU';
  if (!form.cpu_id) errors.cpu_id = 'Select a CPU';
  if (!form.ram_id) errors.ram_id = 'Select RAM';
  if (!form.game_id) errors.game_id = 'Select a game';
  if (!form.resolution) errors.resolution = 'Select a resolution';
  if (!form.graphics_quality)
    errors.graphics_quality = 'Select a quality preset';

  const avg = Number(form.avg_fps);
  const min = Number(form.min_fps);
  const max = Number(form.max_fps);

  if (!form.avg_fps || isNaN(avg) || avg <= 0)
    errors.avg_fps = 'Enter a valid avg FPS';
  if (!form.min_fps || isNaN(min) || min <= 0)
    errors.min_fps = 'Enter a valid min FPS';
  if (!form.max_fps || isNaN(max) || max <= 0)
    errors.max_fps = 'Enter a valid max FPS';
  if (
    form.avg_fps &&
    form.min_fps &&
    !errors.avg_fps &&
    !errors.min_fps &&
    min > avg
  )
    errors.min_fps = 'Min FPS should be ≤ avg FPS';
  if (
    form.avg_fps &&
    form.max_fps &&
    !errors.avg_fps &&
    !errors.max_fps &&
    max < avg
  )
    errors.max_fps = 'Max FPS should be ≥ avg FPS';

  const s = Number(form.score);
  if (!form.score || isNaN(s) || s < 0) errors.score = 'Enter a valid Score';

  return errors;
}

// ─── Mock API submit ─────────────────────────────────────────────────────────
// Replace this with your real API Gateway endpoint.

async function submitBenchmark(payload: object): Promise<void> {
  // TODO: replace with your real API Gateway URL
  // await fetch('/api/benchmarks', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  console.log('[CreateBenchmark] Submitting:', payload);
  await new Promise((resolve) => setTimeout(resolve, 900)); // simulate network
}

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

function SuccessMessage({
  onAnother,
  onBack,
}: {
  onAnother: () => void;
  onBack: () => void;
}) {
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
          // type="button"
          // onClick={onBack}
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
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
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
            // type="button"
            // onClick={onConfirm}
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

export function CreateBenchmarkPage({ onBack }: CreateBenchmarkPageProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmBackOpen, setConfirmBackOpen] = useState(false);

  function requestBack() {
    setConfirmBackOpen(true);
  }

  function confirmBack() {
    setConfirmBackOpen(false);
    onBack();
  }

  function cancelBack() {
    setConfirmBackOpen(false);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErrorField = document.querySelector('[role="alert"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      await submitBenchmark({
        gpu_id: form.gpu_id,
        cpu_id: form.cpu_id,
        ram_id: form.ram_id,
        game_id: form.game_id,
        resolution: Number(form.resolution),
        graphics_quality: form.graphics_quality,
        avg_fps: Number(form.avg_fps),
        min_fps: Number(form.min_fps),
        max_fps: Number(form.max_fps),
        score: Number(form.score),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Failed to save benchmark. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleAnother() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
  }

  if (submitted) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <PageHeader onBack={onBack} />
        <SuccessMessage onAnother={handleAnother} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <PageHeader onBack={requestBack} />

      <ConfirmBackDialog
        open={confirmBackOpen}
        onConfirm={confirmBack}
        onCancel={cancelBack}
      />

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto max-w-2xl px-6 py-8 pb-36"
        >
          <div className="flex flex-col gap-10">
            {/* ── Hardware ─────────────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <SectionHeader
                title="Hardware"
                subtitle="Select the exact components used during this benchmark run."
              />

              <Field
                label="GPU"
                htmlFor="gpu_id"
                error={errors.gpu_id}
                required
              >
                <Combobox
                  id="gpu_id"
                  options={gpuOptions}
                  value={form.gpu_id}
                  onChange={(v) => set('gpu_id', v)}
                  placeholder="Select a GPU…"
                  searchPlaceholder="Search GPUs…"
                  emptyMessage="No GPUs match your search."
                />
              </Field>

              <Field
                label="CPU"
                htmlFor="cpu_id"
                error={errors.cpu_id}
                required
              >
                <Combobox
                  id="cpu_id"
                  options={cpuOptions}
                  value={form.cpu_id}
                  onChange={(v) => set('cpu_id', v)}
                  placeholder="Select a CPU…"
                  searchPlaceholder="Search CPUs…"
                  emptyMessage="No CPUs match your search."
                />
              </Field>

              <Field
                label="RAM"
                htmlFor="ram_id"
                error={errors.ram_id}
                required
              >
                <Combobox
                  id="ram_id"
                  options={ramOptions}
                  value={form.ram_id}
                  onChange={(v) => set('ram_id', v)}
                  placeholder="Select RAM…"
                  searchPlaceholder="Search RAM…"
                  emptyMessage="No RAM modules match your search."
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
                error={errors.game_id}
                required
              >
                <Combobox
                  id="game_id"
                  options={gameOptions}
                  value={form.game_id}
                  onChange={(v) => set('game_id', v)}
                  placeholder="Select a game…"
                  searchPlaceholder="Search games…"
                  emptyMessage="No games match your search."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Resolution"
                  htmlFor="resolution"
                  error={errors.resolution}
                  required
                >
                  <Combobox
                    id="resolution"
                    options={resolutionOptions}
                    value={form.resolution}
                    onChange={(v) => set('resolution', v)}
                    placeholder="Select…"
                    searchPlaceholder="Search…"
                    emptyMessage="No resolutions found."
                  />
                </Field>

                <Field
                  label="Graphics Quality"
                  htmlFor="graphics_quality"
                  error={errors.graphics_quality}
                  required
                >
                  <Combobox
                    id="graphics_quality"
                    options={qualityOptions}
                    value={form.graphics_quality}
                    onChange={(v) => set('graphics_quality', v)}
                    placeholder="Select…"
                    searchPlaceholder="Search…"
                    emptyMessage="No presets found."
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
                  error={errors.avg_fps}
                  required
                >
                  <Input
                    id="avg_fps"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={9999}
                    placeholder="e.g. 120"
                    value={form.avg_fps}
                    onChange={(e) => set('avg_fps', e.target.value)}
                    className={
                      errors.avg_fps
                        ? 'aria-[invalid=true]:border-destructive border-destructive'
                        : ''
                    }
                  />
                </Field>

                <Field
                  label="Min FPS"
                  htmlFor="min_fps"
                  error={errors.min_fps}
                  required
                >
                  <Input
                    id="min_fps"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={9999}
                    placeholder="e.g. 95"
                    value={form.min_fps}
                    onChange={(e) => set('min_fps', e.target.value)}
                    className={errors.min_fps ? 'border-destructive' : ''}
                  />
                </Field>

                <Field
                  label="Max FPS"
                  htmlFor="max_fps"
                  error={errors.max_fps}
                  required
                >
                  <Input
                    id="max_fps"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={9999}
                    placeholder="e.g. 147"
                    value={form.max_fps}
                    onChange={(e) => set('max_fps', e.target.value)}
                    className={errors.max_fps ? 'border-destructive' : ''}
                  />
                </Field>
              </div>

              <Field
                label="Score"
                htmlFor="score"
                error={errors.score}
                required
              >
                <div className="flex items-center gap-3">
                  <Input
                    id="score"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={99999}
                    step={0.1}
                    placeholder="0000"
                    value={form.score}
                    onChange={(e) => set('score', e.target.value)}
                    className={`max-w-[120px] ${errors.score ? 'border-destructive' : ''}`}
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
            {submitError}
          </p>
        )}
        <div className="mx-auto max-w-2xl">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
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
