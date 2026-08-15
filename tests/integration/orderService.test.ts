import { describe, expect, it } from "vitest";
import { getOrderById, hasApprovedRefund, listOrdersForCustomer } from "@/lib/services/orderService";
import { createTestCustomer, createTestOrder } from "./helpers";
import { prisma } from "@/lib/db/prisma";

describe("orderService", () => {
  it("returns an order for a valid id", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { product: "Widget" });

    const found = await getOrderById(order.id);

    expect(found).not.toBeNull();
    expect(found?.product).toBe("Widget");
  });

  it("returns null for a nonexistent order id", async () => {
    const found = await getOrderById("does-not-exist");
    expect(found).toBeNull();
  });

  it("lists all orders for a customer", async () => {
    const customer = await createTestCustomer();
    const orderA = await createTestOrder(customer.id, { product: "A" });
    const orderB = await createTestOrder(customer.id, { product: "B" });

    const orders = await listOrdersForCustomer(customer.id);

    expect(orders.map((o) => o.id).sort()).toEqual([orderA.id, orderB.id].sort());
  });

  it("reports no approved refund when none exists", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id);

    expect(await hasApprovedRefund(order.id)).toBe(false);
  });

  it("reports an approved refund when one exists", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id);

    await prisma.refundRequest.create({
      data: {
        orderId: order.id,
        customerId: customer.id,
        requestedAmountCents: order.amountCents,
        refundAmountCents: order.amountCents,
        status: "APPROVED",
        reasonCode: "OK",
        reason: "test fixture",
        policyVersion: 1,
      },
    });

    expect(await hasApprovedRefund(order.id)).toBe(true);
  });
});
