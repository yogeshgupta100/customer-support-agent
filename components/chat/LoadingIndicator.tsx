export function LoadingIndicator() {
  return (
    <div className="flex items-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3 shadow-sm">
        <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-foreground-muted" />
        <span
          className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-foreground-muted"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-foreground-muted"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
    </div>
  );
}
