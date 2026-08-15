import { z } from "zod";
import { defineTool } from "@/lib/agent/tools/createTool";
import { describePolicy, getActivePolicy } from "@/lib/services/refundPolicyService";

const inputSchema = z.object({});

export const getRefundPolicyTool = defineTool({
  name: "getRefundPolicy",
  description:
    "Retrieve the current, authoritative refund policy: refund window, non-refundable categories, and the plain-language rules. Always call this before evaluating a refund request — never assume policy details.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  zodSchema: inputSchema,
  successEventType: "POLICY_RETRIEVED",
  run: async () => {
    const policy = await getActivePolicy();
    return describePolicy(policy);
  },
});
