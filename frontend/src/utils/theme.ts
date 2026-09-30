export function readIsDark(): boolean {
  if (typeof document === 'undefined') return true; // SSR guard; first client frame corrects it
  return document.documentElement.classList.contains('dark');
}

export function observeTheme(onChange: (isDark: boolean) => void): () => void {
  const observer = new MutationObserver(() => onChange(readIsDark()));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}
