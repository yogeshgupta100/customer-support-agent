import { describe, expect, it } from "vitest";
import { getOrderTool } from "@/lib/agent/tools/getOrder";
import { armFailureInjection } from "@/lib/agent/debugFailureInjection";
import { prisma } from "@/lib/db/prisma";
import { createTestConversation, createTestCustomer, createTestOrder } from "./helpers";

describe("tool retry system (real tool + real logging)", () => {
  it("recovers from a simulated transient failure and logs FAILED-then-SUCCESS", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { product: "Retry Demo Widget" });
    const conversation = await createTestConversation(customer.id);

    armFailureInjection(conversation.id, "getOrder");

    const result = await getOrderTool.execute(
      { orderId: order.id },
      { conversationId: conversation.id, customerId: customer.id },
    );

    expect(result.isError).toBe(false);
    expect((result.output as { found: boolean }).found).toBe(true);

    const logs = await prisma.agentLog.findMany({
      where: { conversationId: conversation.id, toolName: "getOrder" },
      orderBy: { timestamp: "asc" },
    });

    const statuses = logs.map((l) => l.status);
    expect(statuses).toContain("RETRY");
    expect(statuses[statuses.length - 1]).toBe("SUCCESS");
    expect(logs.find((l) => l.status === "RETRY")?.retryAttempt).toBe(1);
  });

  it("only fails the next call once — the following call succeeds without a retry", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id);
    const conversation = await createTestConversation(customer.id);

    armFailureInjection(conversation.id, "getOrder");
    await getOrderTool.execute({ orderId: order.id }, { conversationId: conversation.id, customerId: customer.id });

    const secondResult = await getOrderTool.execute(
      { orderId: order.id },
      { conversationId: conversation.id, customerId: customer.id },
    );

    expect(secondResult.isError).toBe(false);

    const logs = await prisma.agentLog.findMany({
      where: { conversationId: conversation.id, toolName: "getOrder", status: "RETRY" },
    });
    expect(logs).toHaveLength(1);
  });
});
