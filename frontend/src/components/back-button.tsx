'use client';

import { ChevronLeftIcon } from '@heroicons/react/16/solid';
import { Button } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ─── In-app navigation tracking ──────────────────────────────────────────────
// router.back() is correct when there's a real previous page in *this app's*
// history, but does nothing useful (or leaves the app entirely) if someone
// landed here directly via refresh, a shared link, or typing the URL.
//
// There's no built-in "did the user navigate within this app" signal, so we
// track it ourselves: a module-level counter increments every time the
// pathname changes after the first render. If it's still 0 when Back is
// clicked, this is the first page this session has seen — fall back to a
// known-safe route instead of calling back() into nothing.
//
// Module-level (not state/context) is intentional: this needs to persist
// across every page that mounts a BackButton without wiring a provider, and
// it only ever needs to answer one cheap question ("has anything changed
// since load"), so a plain module variable is the simplest correct tool.
let navigationCount = 0;
let lastSeenPath: string | null = null;

function useTrackNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    if (lastSeenPath === null) {
      // First mount anywhere in the app this session — establish the
      // baseline, don't count it as a navigation.
      lastSeenPath = pathname;
      return;
    }
    if (pathname !== lastSeenPath) {
      navigationCount += 1;
      lastSeenPath = pathname;
    }
  }, [pathname]);
}

type BackButtonProps = {
  /** Where to go if there's no in-app previous page to return to. */
  fallbackHref?: string;
  className?: string;
  label?: string;
};

export default function BackButton({
  fallbackHref = '/',
  className,
  label = 'Back',
}: BackButtonProps) {
  const router = useRouter();
  useTrackNavigation();

  function handlePress() {
    if (navigationCount > 0) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      onPress={handlePress}
      aria-label={label}
    >
      <ChevronLeftIcon className="size-3.5" />
      {/*{label}*/}
    </Button>
  );
}
