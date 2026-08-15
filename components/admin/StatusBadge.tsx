import type { AgentLogStatus } from "@/types/admin";

const STATUS_CLASSES: Record<AgentLogStatus, string> = {
  STARTED: "bg-border/50 text-foreground-muted",
  SUCCESS: "bg-success-tint text-success",
  FAILED: "bg-danger-tint text-danger",
  RETRY: "bg-warning-tint text-warning",
};

export function StatusBadge({ status }: { status: AgentLogStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {status}
    </span>
  );
}
