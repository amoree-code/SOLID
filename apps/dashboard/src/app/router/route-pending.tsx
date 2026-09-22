export function RoutePending() {
  return (
    <output
      aria-live="polite"
      className="flex h-full min-h-40 w-full items-center justify-center p-8 text-sm text-muted-foreground"
    >
      Loading…
    </output>
  );
}
