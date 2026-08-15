import Groq from "groq-sdk";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "groq-sdk/resources/chat/completions";
import { env } from "@/lib/config/env";
import { tools, toolsByName } from "@/lib/agent/tools";
import { SYSTEM_PROMPT } from "@/lib/agent/systemPrompt";
import { AgentError } from "@/lib/agent/errors";
import { logEvent } from "@/lib/logging/agentLogger";
import type { ToolContext } from "@/lib/agent/tools/types";

const client = new Groq({ apiKey: env.GROQ_API_KEY });

const MAX_ITERATIONS = 8;
const MAX_TOKENS = 2048;

const GROQ_TOOLS: ChatCompletionTool[] = tools.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  },
}));

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface RunAgentTurnInput {
  conversationId: string;
  customerId: string;
  history: ChatTurn[];
}

export interface RefundDecisionSummary {
  eligible: boolean;
  reasonCode: string;
  reason: string;
  refundAmount: string;
  policyVersion: number;
  executed: boolean;
}

export interface RunAgentTurnResult {
  reply: string;
  decision?: RefundDecisionSummary;
}

const DECISION_TOOL_NAMES = new Set(["checkRefundEligibility", "processRefund"]);

interface RawDecisionOutput {
  eligible: boolean;
  reasonCode: string;
  reason: string;
  refundAmount: string;
  policyVersion: number;
}

export async function runAgentTurn(input: RunAgentTurnInput): Promise<RunAgentTurnResult> {
  const { conversationId, customerId } = input;
  const context: ToolContext = { conversationId, customerId };
  let lastDecision: RefundDecisionSummary | undefined;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...input.history.map((turn): ChatCompletionMessageParam => ({ role: turn.role, content: turn.content })),
  ];

  await logEvent({ conversationId, eventType: "REQUEST_RECEIVED", status: "SUCCESS" });

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let response: Groq.Chat.Completions.ChatCompletion;
    try {
      response = await client.chat.completions.create({
        model: env.GROQ_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
        tools: GROQ_TOOLS,
        messages,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await logEvent({
        conversationId,
        eventType: "AGENT_ERROR",
        status: "FAILED",
        message,
      });
      throw new AgentError("The assistant is temporarily unavailable. Please try again in a moment.");
    }

    const choice = response.choices[0];
    const message = choice?.message;

    if (!message) {
      await logEvent({
        conversationId,
        eventType: "AGENT_ERROR",
        status: "FAILED",
        message: "Model returned no message.",
      });
      throw new AgentError("I'm sorry, I didn't have a response for that. Could you try again?");
    }

    messages.push({
      role: "assistant",
      content: message.content,
      tool_calls: message.tool_calls,
    });

    const toolCalls = message.tool_calls ?? [];

    if (choice.finish_reason !== "tool_calls" || toolCalls.length === 0) {
      const reply = message.content?.trim();
      await logEvent({ conversationId, eventType: "AGENT_COMPLETED", status: "SUCCESS" });
      return {
        reply: reply || "I'm sorry, I didn't have a response for that. Could you try again?",
        decision: lastDecision,
      };
    }

    for (const call of toolCalls) {
      const tool = toolsByName[call.function.name];

      if (!tool) {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: `Unknown tool: ${call.function.name}`,
        });
        continue;
      }

      let parsedInput: unknown = {};
      try {
        parsedInput = call.function.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        parsedInput = {};
      }

      const { output, isError } = await tool.execute(parsedInput, context);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(output),
      });

      if (!isError && DECISION_TOOL_NAMES.has(tool.name)) {
        const decisionOutput = output as RawDecisionOutput;
        lastDecision = { ...decisionOutput, executed: tool.name === "processRefund" };
      }
    }
  }

  await logEvent({
    conversationId,
    eventType: "AGENT_ERROR",
    status: "FAILED",
    message: `Exceeded max tool-use iterations (${MAX_ITERATIONS}).`,
  });
  throw new AgentError("This is taking longer than expected. Please try rephrasing your request.");
}
