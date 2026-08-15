import { z } from "zod";
import { defineTool } from "@/lib/agent/tools/createTool";
import { listOrdersForCustomer } from "@/lib/services/orderService";
import { formatCurrency } from "@/lib/utils/money";

const inputSchema = z.object({});

export const getOrdersForCustomerTool = defineTool({
  name: "getOrdersForCustomer",
  description:
    "List all orders belonging to the current customer, most recent first. Use this when the customer wants a refund but hasn't said which order.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  zodSchema: inputSchema,
  startedEventType: "ORDER_LOOKUP_STARTED",
  successEventType: "ORDER_LOOKUP_SUCCESS",
  failedEventType: "ORDER_LOOKUP_FAILED",
  run: async (_input, context) => {
    const orders = await listOrdersForCustomer(context.customerId);
    return {
      orders: orders.map((o) => ({
        id: o.id,
        product: o.product,
        category: o.category,
        amount: formatCurrency(o.amountCents),
        orderDate: o.orderDate.toISOString().slice(0, 10),
        status: o.status,
      })),
    };
  },
});
