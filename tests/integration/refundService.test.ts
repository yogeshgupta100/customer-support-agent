import { describe, expect, it } from "vitest";
import { evaluateEligibility, processRefund } from "@/lib/services/refundService";
import { getOrderById } from "@/lib/services/orderService";
import { createTestCustomer, createTestOrder, daysAgo } from "./helpers";

describe("refundService.processRefund", () => {
  it("approves an eligible refund, marks the order REFUNDED, and records the correct amount", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, {
      amountCents: 4500,
      deliveryDate: daysAgo(5),
    });

    const result = await processRefund(order.id, customer.id);

    expect(result.eligible).toBe(true);
    expect(result.reasonCode).toBe("OK");
    expect(result.refundAmountCents).toBe(4500);

    const updatedOrder = await getOrderById(order.id);
    expect(updatedOrder?.status).toBe("REFUNDED");
  });

  it("rejects a refund outside the window and leaves the order unchanged", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { deliveryDate: daysAgo(45) });

    const result = await processRefund(order.id, customer.id);

    expect(result.eligible).toBe(false);
    expect(result.reasonCode).toBe("WINDOW_EXPIRED");

    const unchangedOrder = await getOrderById(order.id);
    expect(unchangedOrder?.status).toBe("DELIVERED");
  });

  it("rejects a refund for a non-refundable category", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { category: "Digital Downloads" });

    const result = await processRefund(order.id, customer.id);

    expect(result.eligible).toBe(false);
    expect(result.reasonCode).toBe("NON_REFUNDABLE_CATEGORY");
  });

  it("rejects a repeated refund attempt on an already-refunded order", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { deliveryDate: daysAgo(5) });

    const first = await processRefund(order.id, customer.id);
    expect(first.eligible).toBe(true);

    const second = await processRefund(order.id, customer.id);
    expect(second.eligible).toBe(false);
    expect(second.reasonCode).toBe("ALREADY_REFUNDED");
  });

  it("rejects when the order belongs to a different customer and makes no mutation", async () => {
    const owner = await createTestCustomer();
    const attacker = await createTestCustomer();
    const order = await createTestOrder(owner.id, { deliveryDate: daysAgo(5) });

    const result = await processRefund(order.id, attacker.id);

    expect(result.eligible).toBe(false);
    expect(result.reasonCode).toBe("CUSTOMER_MISMATCH");

    const unchangedOrder = await getOrderById(order.id);
    expect(unchangedOrder?.status).toBe("DELIVERED");
  });

  it("returns ORDER_NOT_FOUND for a nonexistent order and performs no mutation", async () => {
    const customer = await createTestCustomer();

    const result = await processRefund("does-not-exist", customer.id);

    expect(result.eligible).toBe(false);
    expect(result.reasonCode).toBe("ORDER_NOT_FOUND");
    expect(result.order).toBeNull();
  });

  it("is safe to call directly without a prior evaluateEligibility call", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { category: "Perishables" });

    const result = await processRefund(order.id, customer.id);

    expect(result.eligible).toBe(false);
    expect(result.reasonCode).toBe("NON_REFUNDABLE_CATEGORY");
  });

  it("prevents a double refund when processRefund is called concurrently for the same order", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { deliveryDate: daysAgo(5) });

    const results = await Promise.all(
      Array.from({ length: 10 }, () => processRefund(order.id, customer.id)),
    );

    const approvals = results.filter((r) => r.eligible);
    expect(approvals).toHaveLength(1);

    const finalOrder = await getOrderById(order.id);
    expect(finalOrder?.status).toBe("REFUNDED");
  });
});

describe("refundService.evaluateEligibility", () => {
  it("matches processRefund's decision without mutating the order", async () => {
    const customer = await createTestCustomer();
    const order = await createTestOrder(customer.id, { deliveryDate: daysAgo(5) });

    const decision = await evaluateEligibility(order.id, customer.id);
    expect(decision.eligible).toBe(true);

    const unchangedOrder = await getOrderById(order.id);
    expect(unchangedOrder?.status).toBe("DELIVERED");
  });
});
