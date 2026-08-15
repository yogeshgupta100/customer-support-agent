import { describe, expect, it } from "vitest";
import { checkRefundEligibility } from "@/lib/services/eligibility";
import type { EligibilityOrder, EligibilityPolicy } from "@/types/refund";

const POLICY: EligibilityPolicy = {
  version: 1,
  refundWindowDays: 30,
  nonRefundableCategories: ["Digital Downloads", "Perishables"],
};

const NOW = new Date("2026-08-13T00:00:00Z");

function daysBefore(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

function makeOrder(overrides: Partial<EligibilityOrder> = {}): EligibilityOrder {
  return {
    id: "order-1",
    customerId: "customer-1",
    category: "Electronics",
    amountCents: 5000,
    deliveryDate: daysBefore(5),
    status: "DELIVERED",
    ...overrides,
  };
}

describe("checkRefundEligibility", () => {
  it("approves an order within the window, in an eligible category, not previously refunded", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder(),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(true);
    expect(decision.reasonCode).toBe("OK");
    expect(decision.refundAmountCents).toBe(5000);
    expect(decision.policyVersion).toBe(1);
  });

  it("rejects when the refund window has expired", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder({ deliveryDate: daysBefore(45) }),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("WINDOW_EXPIRED");
    expect(decision.refundAmountCents).toBe(0);
  });

  it("rejects a non-refundable category", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder({ category: "Digital Downloads" }),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("NON_REFUNDABLE_CATEGORY");
  });

  it("rejects an order that is already refunded (status)", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder({ status: "REFUNDED" }),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("ALREADY_REFUNDED");
  });

  it("rejects an order that is already refunded (prior approved refund record)", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder(),
      policy: POLICY,
      hasPriorApprovedRefund: true,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("ALREADY_REFUNDED");
  });

  it("rejects when the order does not exist", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: null,
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("ORDER_NOT_FOUND");
  });

  it("rejects when the order belongs to a different customer", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "someone-else",
      order: makeOrder({ customerId: "customer-1" }),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("CUSTOMER_MISMATCH");
  });

  it("rejects an order that has not yet been delivered", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder({ deliveryDate: null }),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("WINDOW_EXPIRED");
  });

  it("approves exactly at the boundary of the refund window", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder({ deliveryDate: daysBefore(30) }),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(true);
  });

  it("rejects just past the boundary of the refund window", () => {
    const decision = checkRefundEligibility({
      requestingCustomerId: "customer-1",
      order: makeOrder({ deliveryDate: daysBefore(31) }),
      policy: POLICY,
      hasPriorApprovedRefund: false,
      now: NOW,
    });

    expect(decision.eligible).toBe(false);
    expect(decision.reasonCode).toBe("WINDOW_EXPIRED");
  });
});
