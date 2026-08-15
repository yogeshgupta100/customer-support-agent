import { z } from "zod";
import { defineTool } from "@/lib/agent/tools/createTool";
import { evaluateEligibility } from "@/lib/services/refundService";
import { formatCurrency } from "@/lib/utils/money";

const inputSchema = z.object({ orderId: z.string().min(1) });

export const checkRefundEligibilityTool = defineTool({
  name: "checkRefundEligibility",
  description:
    "Deterministically check whether an order is eligible for a refund under the current policy. Read-only — does not process the refund. The result (eligible/reasonCode/reason) is authoritative; do not override it.",
  inputSchema: {
    type: "object",
    properties: { orderId: { type: "string", description: "The order ID to evaluate." } },
    required: ["orderId"],
    additionalProperties: false,
  },
  zodSchema: inputSchema,
  startedEventType: "ELIGIBILITY_CHECK_STARTED",
  successEventType: "ELIGIBILITY_CHECK_RESULT",
  run: async ({ orderId }, context) => {
    const decision = await evaluateEligibility(orderId, context.customerId);
    return {
      eligible: decision.eligible,
      reasonCode: decision.reasonCode,
      reason: decision.reason,
      refundAmount: formatCurrency(decision.refundAmountCents),
      policyVersion: decision.policyVersion,
    };
  },
});
