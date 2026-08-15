import { z } from "zod";
import { defineTool } from "@/lib/agent/tools/createTool";
import { getOrderById } from "@/lib/services/orderService";
import { formatCurrency } from "@/lib/utils/money";

const inputSchema = z.object({ orderId: z.string().min(1) });

export const getOrderTool = defineTool({
  name: "getOrder",
  description:
    "Retrieve a single order by its ID, scoped to the current customer. Reports not-found if the order does not exist or does not belong to this customer (never reveals another customer's order).",
  inputSchema: {
    type: "object",
    properties: { orderId: { type: "string", description: "The order ID to look up." } },
    required: ["orderId"],
    additionalProperties: false,
  },
  zodSchema: inputSchema,
  startedEventType: "ORDER_LOOKUP_STARTED",
  successEventType: "ORDER_LOOKUP_SUCCESS",
  failedEventType: "ORDER_LOOKUP_FAILED",
  run: async ({ orderId }, context) => {
    const order = await getOrderById(orderId);
    if (!order || order.customerId !== context.customerId) {
      return { found: false };
    }
    return {
      found: true,
      id: order.id,
      product: order.product,
      category: order.category,
      amount: formatCurrency(order.amountCents),
      orderDate: order.orderDate.toISOString().slice(0, 10),
      deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString().slice(0, 10) : null,
      paymentMethod: order.paymentMethod,
      status: order.status,
    };
  },
});
