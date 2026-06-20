import { Button } from '@heroui/react';
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';

export function SuccessMessage({ onAnother }: { onAnother: () => void }) {
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
        <Button variant="outline" onPress={onAnother}>
          Add another
        </Button>
        <Link
          href="/benchmarks"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to benchmarks
        </Link>
      </div>
    </div>
  );
}
