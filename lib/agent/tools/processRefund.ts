import { z } from "zod";
import { defineTool } from "@/lib/agent/tools/createTool";
import { processRefund as processRefundService } from "@/lib/services/refundService";
import { formatCurrency } from "@/lib/utils/money";
import type { AgentEventType } from "@/lib/generated/prisma/client";

const inputSchema = z.object({ orderId: z.string().min(1) });

export const processRefundTool = defineTool({
  name: "processRefund",
  description:
    "Attempt to process a refund for an order. Internally re-validates eligibility server-side regardless of any prior check, and refuses to execute if the order is not actually eligible. Refund amount is always the original order amount — it cannot be overridden.",
  inputSchema: {
    type: "object",
    properties: { orderId: { type: "string", description: "The order ID to refund." } },
    required: ["orderId"],
    additionalProperties: false,
  },
  zodSchema: inputSchema,
  startedEventType: "REFUND_PROCESS_STARTED",
  successEventType: (result): AgentEventType =>
    (result as { eligible: boolean }).eligible ? "REFUND_PROCESSED" : "REFUND_DENIED",
  run: async ({ orderId }, context) => {
    const result = await processRefundService(orderId, context.customerId);
    return {
      eligible: result.eligible,
      reasonCode: result.reasonCode,
      reason: result.reason,
      refundAmount: formatCurrency(result.refundAmountCents),
      policyVersion: result.policyVersion,
      orderStatus: result.order?.status ?? null,
    };
  },
});
