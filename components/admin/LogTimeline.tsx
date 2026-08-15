import type { AgentLogEntry } from "@/types/admin";
import { StatusBadge } from "@/components/admin/StatusBadge";

function humanizeEventType(eventType: string): string {
  const lower = eventType.toLowerCase().replaceAll("_", " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LogTimeline({ logs }: { logs: AgentLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <p className="p-6 text-sm text-foreground-muted">
        No execution events yet for this conversation.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2 p-4">
      {logs.map((log) => (
        <li
          key={log.id}
          className="animate-fade-in-up flex flex-col gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-foreground-muted">{formatTime(log.timestamp)}</span>
            <span className="font-medium text-foreground">{humanizeEventType(log.eventType)}</span>
            <StatusBadge status={log.status} />
            {log.toolName && (
              <span className="rounded bg-border/40 px-1.5 py-0.5 font-mono text-xs text-foreground-muted">
                {log.toolName}
              </span>
            )}
            {typeof log.retryAttempt === "number" && (
              <span className="text-xs text-warning">retry {log.retryAttempt}/2</span>
            )}
            {typeof log.durationMs === "number" && (
              <span className="text-xs text-foreground-muted">{log.durationMs}ms</span>
            )}
          </div>
          {log.message && <p className="text-xs text-foreground-muted">{log.message}</p>}
        </li>
      ))}
    </ol>
  );
}
