import type { z } from "zod";
import { withRetry } from "@/lib/retry";
import { logEvent } from "@/lib/logging/agentLogger";
import { consumeFailureInjection } from "@/lib/agent/debugFailureInjection";
import type { AgentEventType, Prisma } from "@/lib/generated/prisma/client";
import type { ToolContext, ToolExecutionResult } from "@/lib/agent/tools/types";

export interface ToolDefinition<TInput> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  zodSchema: z.ZodType<TInput>;
  startedEventType?: AgentEventType;
  successEventType: AgentEventType | ((result: unknown) => AgentEventType);
  failedEventType?: AgentEventType;
  run: (input: TInput, context: ToolContext) => Promise<unknown>;
}

export interface ExecutableTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (rawInput: unknown, context: ToolContext) => Promise<ToolExecutionResult>;
}

function safeMetadata(result: unknown): Record<string, unknown> | undefined {
  if (result && typeof result === "object" && !Array.isArray(result)) {
    return result as Record<string, unknown>;
  }
  return undefined;
}

export function defineTool<TInput>(def: ToolDefinition<TInput>): ExecutableTool {
  return {
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema,
    async execute(rawInput, context) {
      const parsed = def.zodSchema.safeParse(rawInput ?? {});
      if (!parsed.success) {
        await logEvent({
          conversationId: context.conversationId,
          eventType: def.failedEventType ?? "TOOL_FAILED",
          status: "FAILED",
          toolName: def.name,
          message: `Invalid tool input: ${parsed.error.message}`,
        });
        return {
          output: { error: "Invalid tool input", details: parsed.error.flatten() },
          isError: true,
        };
      }

      if (def.startedEventType) {
        await logEvent({
          conversationId: context.conversationId,
          eventType: def.startedEventType,
          status: "STARTED",
          toolName: def.name,
        });
      }

      const start = Date.now();
      let retryAttempt = 0;

      try {
        const result = await withRetry(
          async () => {
            if (consumeFailureInjection(context.conversationId, def.name)) {
              throw new Error("Simulated transient failure (demo/debug trigger)");
            }
            return def.run(parsed.data, context);
          },
          {
            retries: 2,
            backoffMs: 300,
            onRetry: async (attempt, err) => {
              retryAttempt = attempt;
              await logEvent({
                conversationId: context.conversationId,
                eventType: "TOOL_RETRY",
                status: "RETRY",
                toolName: def.name,
                retryAttempt: attempt,
                message: err instanceof Error ? err.message : String(err),
              });
            },
          },
        );

        const successEventType =
          typeof def.successEventType === "function" ? def.successEventType(result) : def.successEventType;

        await logEvent({
          conversationId: context.conversationId,
          eventType: successEventType,
          status: "SUCCESS",
          toolName: def.name,
          durationMs: Date.now() - start,
          retryAttempt: retryAttempt || undefined,
          metadata: safeMetadata(result) as Prisma.InputJsonValue | undefined,
        });

        return { output: result, isError: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await logEvent({
          conversationId: context.conversationId,
          eventType: def.failedEventType ?? "TOOL_FAILED",
          status: "FAILED",
          toolName: def.name,
          durationMs: Date.now() - start,
          retryAttempt: retryAttempt || undefined,
          message,
        });
        return { output: { error: message }, isError: true };
      }
    },
  };
}
