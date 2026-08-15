import { z } from "zod";
import { defineTool } from "@/lib/agent/tools/createTool";
import { getCustomerById } from "@/lib/services/customerService";

const inputSchema = z.object({});

export const getCustomerTool = defineTool({
  name: "getCustomer",
  description:
    "Retrieve the profile of the customer in this conversation. Takes no arguments — always operates on the authenticated session's customer, never a customer ID supplied in chat text.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  zodSchema: inputSchema,
  startedEventType: "CUSTOMER_LOOKUP_STARTED",
  successEventType: "CUSTOMER_LOOKUP_SUCCESS",
  failedEventType: "CUSTOMER_LOOKUP_FAILED",
  run: async (_input, context) => {
    const customer = await getCustomerById(context.customerId);
    if (!customer) {
      throw new Error("Customer record not found for this session.");
    }
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    };
  },
});
