export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
      {children}
    </p>
  );
}
