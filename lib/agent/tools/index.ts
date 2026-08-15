import { getCustomerTool } from "@/lib/agent/tools/getCustomer";
import { getOrderTool } from "@/lib/agent/tools/getOrder";
import { getOrdersForCustomerTool } from "@/lib/agent/tools/getOrdersForCustomer";
import { getRefundPolicyTool } from "@/lib/agent/tools/getRefundPolicy";
import { checkRefundEligibilityTool } from "@/lib/agent/tools/checkRefundEligibility";
import { processRefundTool } from "@/lib/agent/tools/processRefund";
import type { ExecutableTool } from "@/lib/agent/tools/createTool";

export const tools: ExecutableTool[] = [
  getCustomerTool,
  getOrderTool,
  getOrdersForCustomerTool,
  getRefundPolicyTool,
  checkRefundEligibilityTool,
  processRefundTool,
];

export const toolsByName: Record<string, ExecutableTool> = Object.fromEntries(
  tools.map((tool) => [tool.name, tool]),
);

export const TOOL_NAMES = tools.map((tool) => tool.name) as [string, ...string[]];
