export interface ConversationSummary {
  id: string;
  createdAt: string;
  customer: { id: string; name: string; email: string };
  messageCount: number;
  logCount: number;
}

export type AgentLogStatus = "STARTED" | "SUCCESS" | "FAILED" | "RETRY";

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  toolName: string | null;
  status: AgentLogStatus;
  durationMs: number | null;
  retryAttempt: number | null;
  message: string | null;
  metadata: unknown;
}
