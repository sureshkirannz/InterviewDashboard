export function LiveBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20"
      data-testid="badge-live"
    >
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs font-medium uppercase tracking-wide text-primary">
        Live
      </span>
    </div>
  );
}
