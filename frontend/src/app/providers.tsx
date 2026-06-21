'use client';

import { Toast } from '@heroui/react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Toast.Provider aria-label="Notifications" />
        {children}
      </ThemeProvider>
    </>
  );
}
