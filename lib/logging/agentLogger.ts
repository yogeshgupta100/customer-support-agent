import { prisma } from "@/lib/db/prisma";
import type { AgentEventType, AgentLogStatus, Prisma } from "@/lib/generated/prisma/client";

export interface LogEventInput {
  conversationId: string;
  eventType: AgentEventType;
  status: AgentLogStatus;
  toolName?: string;
  durationMs?: number;
  retryAttempt?: number;
  message?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function logEvent(input: LogEventInput): Promise<void> {
  await prisma.agentLog.create({
    data: {
      conversationId: input.conversationId,
      eventType: input.eventType,
      status: input.status,
      toolName: input.toolName,
      durationMs: input.durationMs,
      retryAttempt: input.retryAttempt,
      message: input.message,
      metadata: input.metadata,
    },
  });
}
