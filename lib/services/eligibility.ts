import type { EligibilityDecision, EligibilityOrder, EligibilityPolicy } from "@/types/refund";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface CheckRefundEligibilityInput {
  requestingCustomerId: string;
  order: EligibilityOrder | null;
  policy: EligibilityPolicy;
  hasPriorApprovedRefund: boolean;
  now?: Date;
}

export function checkRefundEligibility(input: CheckRefundEligibilityInput): EligibilityDecision {
  const { requestingCustomerId, order, policy, hasPriorApprovedRefund } = input;
  const now = input.now ?? new Date();

  if (!order) {
    return {
      eligible: false,
      reasonCode: "ORDER_NOT_FOUND",
      reason: "No order was found with that ID.",
      refundAmountCents: 0,
      policyVersion: policy.version,
    };
  }

  if (order.customerId !== requestingCustomerId) {
    return {
      eligible: false,
      reasonCode: "CUSTOMER_MISMATCH",
      reason: "This order does not belong to the requesting customer.",
      refundAmountCents: 0,
      policyVersion: policy.version,
    };
  }

  if (order.status === "REFUNDED" || hasPriorApprovedRefund) {
    return {
      eligible: false,
      reasonCode: "ALREADY_REFUNDED",
      reason: "This order has already been refunded and cannot be refunded again.",
      refundAmountCents: 0,
      policyVersion: policy.version,
    };
  }

  if (policy.nonRefundableCategories.includes(order.category)) {
    return {
      eligible: false,
      reasonCode: "NON_REFUNDABLE_CATEGORY",
      reason: `Items in the "${order.category}" category are not eligible for refunds under the current policy.`,
      refundAmountCents: 0,
      policyVersion: policy.version,
    };
  }

  if (!order.deliveryDate) {
    return {
      eligible: false,
      reasonCode: "WINDOW_EXPIRED",
      reason: "This order has not yet been delivered, so a refund cannot be requested.",
      refundAmountCents: 0,
      policyVersion: policy.version,
    };
  }

  const daysSinceDelivery = (now.getTime() - order.deliveryDate.getTime()) / MS_PER_DAY;
  if (daysSinceDelivery > policy.refundWindowDays) {
    return {
      eligible: false,
      reasonCode: "WINDOW_EXPIRED",
      reason: `The refund window of ${policy.refundWindowDays} days has expired (delivered ${Math.floor(daysSinceDelivery)} days ago).`,
      refundAmountCents: 0,
      policyVersion: policy.version,
    };
  }

  return {
    eligible: true,
    reasonCode: "OK",
    reason: "Order is within the refund window, in an eligible category, and has not been refunded before.",
    refundAmountCents: order.amountCents,
    policyVersion: policy.version,
  };
}
